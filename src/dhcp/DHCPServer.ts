/** 
 * A simple DHCP server.
 * 
 * It assigns IP inside a default subnet to local devices.
 * It can use to perform more advanced operations by moving local devices to other subnets.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter = require("events");
import arp from "@network-utils/arp-lookup";
import * as macAddressHelper from "macaddress";
import * as ipUtil from "ip";

import { DHCPServerMessenger, Request } from "./DHCPMessenger";
import { Settings } from "../utils/Settings";
import { vendorForMac } from "../utils/MacUtils";

export const LOCAL_DOMAIN = "local";
export const LEASE_TIME = 5 * 60 /* 5 minutes */;
export const UNASSIGNED_IP = "<unassigned>";

export type Subnet = {
    readonly mask: string;
    readonly dhcp: string;
    readonly router: string;
    readonly dns: string;
}

export enum IpType {
    STATIC = "STATIC",
    DYNAMIC = "DYNAMIC",
}

export type StoredDevice = {
    readonly ipType: IpType;
    readonly mac: string;
    ip: string;
    subnet: Subnet;
}

export type SubnetConfiguration = {
    defaultSubnet: Subnet,
    perMacDevice?: Record<string, Subnet>,
}

export type Device = StoredDevice & {
    hostname?: string;
    classId?: string;
    pendingChanges: boolean;
    lastSeen?: number;
    vendor: string;
}

export enum DHCP_SERVER_EVENTS {
    NEW_DEVICE = "new_device",
    UPDATE_DEVICE = "update_device",
}

export declare interface DHCPServer {
    on(event: DHCP_SERVER_EVENTS.NEW_DEVICE, listener: (device: Device) => void): this;
    on(event: DHCP_SERVER_EVENTS.UPDATE_DEVICE, listener: (device: Device) => void): this;
}

export function getBroadcastAddress(subnet: Subnet) {
    return ipUtil.subnet(subnet.dhcp, subnet.mask).broadcastAddress;
}

export class DHCPServer extends EventEmitter {
    private readonly settings = new Settings("dhcp");
    private readonly deviceSettings = this.settings.getSetting<Record<string, StoredDevice>>("devices");
    private readonly messenger = new DHCPServerMessenger();
    private readonly deviceByMac = new Map<string, Device>();
    private readonly assignedIps = new Map<string, Device>();
    private readonly defaultSubnet: Subnet;
    private readonly subnetPerMac: Record<string, Subnet>;

    constructor({ defaultSubnet, perMacDevice }: SubnetConfiguration) {
        super();
        this.defaultSubnet = defaultSubnet;
        this.subnetPerMac = perMacDevice ?? {};
        this.messenger.on("discover", request => this.handleDiscover(request));
        this.messenger.on("request", request => this.handleRequest(request));
    }

    async start() {
        this.loadSettings();
        const { router: routerIp, dhcp: dhcpIp } = this.defaultSubnet;
        const routerMac = await arp.toMAC(routerIp);
        if (routerMac === null) throw new Error("Cannot find the router");
        const dhcpMac = await macAddressHelper.one();
        if (!this.deviceByMac.has(routerMac)) {
            this.createDevice({ mac: routerMac, hostname: "router", staticIp: routerIp});
        }
        if (!this.deviceByMac.has(dhcpMac)) {
            this.createDevice({ mac: dhcpMac, hostname: "dhcp", staticIp: dhcpIp});
        }
        this.messenger.listen();
    }

    private loadSettings() {
        for (var key in this.deviceSettings) {
            const { mac, ip, ipType, subnet } = this.deviceSettings[key];
            const device: Device = { mac, ip, ipType, subnet, pendingChanges: ipType == IpType.DYNAMIC ? true : false, vendor: vendorForMac(mac) };
            if (this.deviceByMac.has(mac)) {
                throw new Error(`Cannot add ${JSON.stringify(device)}: there is already another device with this MAC address`);
            }
            this.deviceByMac.set(mac, device);

            if (ip === UNASSIGNED_IP) continue;

            if (this.assignedIps.has(ip)) {
                device.ip = UNASSIGNED_IP;
            } else {
                this.assignedIps.set(ip, device);
            }
        }
    }

    stop() {
        this.messenger.close();
    }

    getDeviceByMac(mac: string) {
        return this.deviceByMac.get(mac);
    }

    getDevices() {
        const result = new Array<Device>();
        [...this.deviceByMac.values()].forEach(device => result.push(device));
        return result;
    }

    switchSubnet(mac: string, subnet: Subnet) {
        this.subnetPerMac[mac] = subnet;
        const device = this.deviceByMac.get(mac);
        if (device === undefined) throw new Error(`Cannot find device with MAC ${mac}`);
        this.updateDevice(device, {subnet});
    }

    private handleDiscover(request: Request) {
        const device = this.getDevice(request);
        this.updateDevice(device, {pendingChanges: true, lastSeen: Date.now(), ip: device.ip === UNASSIGNED_IP ? this.getNewIp(device) : undefined});
        this.messenger.sendOffer(request, device);
    }

    private handleRequest(request: Request) {
        const device = this.getDevice(request);
        const addressRequested = request.requestedIp ?? request.ip;
        if (addressRequested !== device.ip) {
            this.updateDevice(device, {pendingChanges: true, lastSeen: Date.now()});
            this.messenger.sendNak(request, device);
        } else {
            this.updateDevice(device, {pendingChanges: false, lastSeen: Date.now()});
            this.messenger.sendAck(request, device);
        }
    }

    private getDevice(request: Request): Device {
        const { mac, hostname, classId } = request;
    
        var device = this.deviceByMac.get(mac);
        if (device === undefined) {
            device = this.createDevice({ mac, hostname, classId });
        } else {
           this.updateDevice(device, { hostname, classId });
        }
        return device;
    }

    private createDevice({ mac, hostname, classId, staticIp }: { mac: string, hostname?: string, classId?: string, staticIp?: string }) {
        const device: Device = {
            mac: mac.toUpperCase(),
            ipType: staticIp ? IpType.STATIC : IpType.DYNAMIC,
            ip: staticIp !== undefined ? staticIp : UNASSIGNED_IP,
            hostname,
            classId,
            pendingChanges: false,
            subnet: this.assignSubnet(mac),
            vendor: vendorForMac(mac),
        };
        this.emit(DHCP_SERVER_EVENTS.NEW_DEVICE, device);
        this.persistDeviceConfig(device);
        this.deviceByMac.set(mac, device);
        if (staticIp !== undefined) this.assignedIps.set(staticIp, device);
        return device;
    }

    private updateDevice(device: Device, { hostname, classId, subnet, pendingChanges, lastSeen, ip }: { hostname?: string, classId?: string, subnet?: Subnet, pendingChanges?: boolean, lastSeen?: number, ip?: string }) {
        var storedDataUpdated = false;
        var updated = false;
        if (hostname !== undefined && device.hostname !== hostname) {
            device.hostname = hostname;
            updated = true;
        }
        if (classId !== undefined && device.classId !== classId) {
            device.classId = classId;
            updated = true;
        }
        if (pendingChanges !== undefined && device.pendingChanges !== pendingChanges) {
            device.pendingChanges = pendingChanges;
            updated = true;
        }
        if (lastSeen !== undefined && device.lastSeen !== lastSeen) {
            device.lastSeen = lastSeen;
            updated = true;
        }
        if (subnet !== undefined && device.subnet !== subnet) {
            if (device.ipType ===  IpType.STATIC) {
                throw new Error("Devices with static IP cannot be moved to another subnet.");
            }
            device.subnet = subnet;
            ip = this.getNewIp(device);
            device.pendingChanges = true;
            storedDataUpdated = true;
            updated = true;
        }
        if (ip !== undefined && device.ip !== ip) {
            if (device.ip !== UNASSIGNED_IP) {
                this.assignedIps.delete(device.ip);
            }
            device.ip = ip;
            if (ip !== UNASSIGNED_IP) {
                this.assignedIps.set(device.ip, device);
            }
            device.pendingChanges = true;
            storedDataUpdated = true;
            updated = true;
        }

        if (storedDataUpdated) {
            this.persistDeviceConfig(device);
        }
        if (updated) {
            this.emit(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device);
        }
    }

    private persistDeviceConfig(device: Device) {
        const { mac, ipType, ip, subnet } = device;
        this.deviceSettings[mac] = {mac, ipType, ip, subnet};
        this.settings.save();
    }

    private assignSubnet(mac: string) {
        return this.subnetPerMac[mac] ?? this.defaultSubnet;
    }

    private getNewIp(device: Device) {
        const subnet = device.subnet;
        const prefix = ipUtil.mask(subnet.router, subnet.mask).slice(0, -1);
        var ipAddress = 1;
        while (true) {
            const proposedIp = prefix + ipAddress;
            if (!this.assignedIps.has(proposedIp)) {
                return proposedIp;
            }
            ipAddress++;
            if (ipAddress == 255) {
                // No more available IP on the subnet
                break;
            }
        }

        // Try to free an IP from a device not connected
        [...this.assignedIps.entries()]
            .filter(([ip, {ipType, lastSeen}]) => ip.startsWith(prefix) && ipType === IpType.DYNAMIC && Date.now() - (lastSeen ?? 0) > LEASE_TIME)
            .forEach(([, otherDevice]) => {
                const freedIp = otherDevice.ip;
                this.updateDevice(otherDevice, {ip: UNASSIGNED_IP});
                return freedIp;
            });

        throw new Error(`No more available IP addresses in the subnet ${prefix}`);
    }
}
