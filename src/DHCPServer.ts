/** 
 * A simple DHCP server.
 * 
 * It assigns IP inside a default subnet to local devices.
 * It can use to perform more advanced operations by moving local devices to other subnets.
 * 
 */

import EventEmitter = require("events");
import arp from "@network-utils/arp-lookup";
import * as macAddressHelper from "macaddress";
import * as ip from "ip";

import { DHCPServerMessenger, Request } from "./DHCPMessenger";

const LEASE_TIME = 5 * 60 /* 5 minutes */;

export class Subnet {
    readonly leaseTimeSeconds = LEASE_TIME;

    constructor(
        readonly mask: string,
        readonly dhcp: string,
        readonly router: string,
        readonly dns: string) {
    }
}

export enum IpType {
    STATIC = "STATIC",
    DHCP = "DHCP",
}

export class Device {
    readonly ipType: IpType;
    ip: string;
    mac: string;
    hostname?: string;
    classId?: string;
    displayName: string;
    pendingChanges: boolean = false;
    lastSeen?: number;

    constructor(
        displayName: string,
        mac: string,
        ipType: IpType,
        ip?: string,
        hostName?: string,
        vendorClassIdentifier?: string) {
        this.displayName = displayName;
        this.mac = mac;
        this.hostname = hostName;
        this.ip = ip;
        this.ipType = ipType;
        this.classId = vendorClassIdentifier;
    }

    toString() {
        return `{Name:${this.displayName} MAC:${this.mac} IP:${this.ip} hostname:${this.hostname} classId:${this.classId}}`;
    }
}

export enum DHCP_SERVER_EVENTS {
    NEW_DEVICE = "new_device",
    UPDATE_DEVICE = "update_device",
}

export declare interface DHCPServer {
    on(event: DHCP_SERVER_EVENTS.NEW_DEVICE, listener: (device: Device) => void): this;
    on(event: DHCP_SERVER_EVENTS.UPDATE_DEVICE, listener: (device: Device) => void): this;
}

export class DHCPServer extends EventEmitter {
    readonly messenger = new DHCPServerMessenger();
    readonly deviceByMac = new Map<string, Device>();
    readonly deviceByIp = new Map<string, Device>();
    readonly subnetByDevice = new Map<Device, Subnet>();

    constructor(readonly defaultSubnet: Subnet) {
        super();
        this.messenger.on("discover", request => this.handleDiscover(request));
        this.messenger.on("request", request => this.handleRequest(request));
    }

    async start() {
        const { router: routerIp, dhcp: dhcpIp } = this.defaultSubnet;
        this.createDevice({ mac: await arp.toMAC(routerIp), hostname: "router", staticIp: routerIp});
        this.createDevice({ mac: await macAddressHelper.one(), hostname: "dhcp", staticIp: dhcpIp});
        this.messenger.listen();
    }

    stop() {
        this.messenger.close();
    }

    getDeviceByMac(mac: string) {
        return this.deviceByMac.get(mac);
    }

    getDevices() {
        const result = new Array<{device: Device, subnet: Subnet}>();
        [...this.deviceByIp.values()].forEach(device => result.push({device, subnet: this.subnetByDevice.get(device)}));
        return result;
    }

    switchSubnet(device: Device, subnet: Subnet) {
        if (device.ipType ===  IpType.STATIC) {
            throw new Error("Devices with static IP cannot be moved to another subnet.");
        }
        this.deviceByIp.delete(device.ip);
        this.subnetByDevice.delete(device);
        device.ip = this.assignIp(subnet);
        device.pendingChanges = true;
        this.deviceByIp.set(device.ip, device);
        this.subnetByDevice.set(device, subnet);
    }

    private handleDiscover(request: Request) {
        const device = this.getDevice(request);
        const subnet = this.subnetByDevice.get(device);
        device.pendingChanges = true;
        device.lastSeen = Date.now();
        if (device.ip === undefined) {
            device.ip = this.assignIp(subnet);
            this.deviceByIp.set(device.ip, device);
        }
        this.messenger.sendOffer(request, device, subnet);
    }

    private handleRequest(request: Request) {
        const device = this.getDevice(request);
        device.lastSeen = Date.now();
        const addressRequested = request.ip !== undefined ? request.ip : request.requestedIp;
        if (addressRequested !== device.ip) {
            device.pendingChanges = true;
            this.messenger.sendNak(request, device, this.subnetByDevice.get(device));
        } else {
            device.pendingChanges = false;
            this.messenger.sendAck(request, device, this.subnetByDevice.get(device));
        }
    }

    private getDevice(request: Request): Device {
        const { mac, hostname, classId } = request;
    
        var device = this.deviceByMac.get(mac);
        if (device === undefined) {
            device = this.createDevice({ mac, hostname, classId });
        } else {
           this.updateDevice(device, { hostname, classId});
        }
        return device;
    }

    private createDevice({ mac, hostname, classId, staticIp }: { mac: string, hostname?: string, classId?: string, staticIp?: string}) {
        const subnet = this.defaultSubnet;
        const displayName = (hostname !== undefined) ? hostname : mac;
        const device = new Device(displayName, mac, staticIp ? IpType.STATIC : IpType.DHCP, staticIp, hostname, classId);
        this.emit(DHCP_SERVER_EVENTS.NEW_DEVICE, device);
        this.deviceByMac.set(mac, device);
        if (staticIp !== undefined) this.deviceByIp.set(staticIp, device);
        this.subnetByDevice.set(device, subnet);
        return device;
    }

    private updateDevice(device: Device, { hostname, classId }: { hostname?: string, classId?: string}) {
        var updated = false;
        if (hostname !== undefined && device.hostname !== hostname) {
            device.hostname = hostname;
            updated = true;
        }
        if (classId !== undefined && device.classId !== classId) {
            device.classId = classId;
            updated = true;
        }
        if (updated) {
            this.emit(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device);
        }
    }

    private assignIp(subnet: Subnet) {
        const prefix = ip.mask(subnet.router, subnet.mask).slice(0, -1);
        var ipAddress = 1;
        while (true) {
            const ip = prefix + ipAddress;
            if (!this.deviceByIp.has(ip)) {
                return ip;
            }
            ipAddress++;
            if (ipAddress == 255) {
                // No more available IP on the subnet
                break;
            }
        }

        // Try to free an IP from a device not connected
        [...this.subnetByDevice.entries()]
            .filter(([, deviceSubnet]) => deviceSubnet == subnet)
            .forEach(([device]) => {
                if (device.ipType === IpType.STATIC) return;
                if (device.ip === undefined) return;
                if (Date.now() - device.lastSeen < LEASE_TIME) return;
                const freedIp = device.ip;
                device.ip = undefined;
                this.deviceByIp.delete(freedIp);
                return freedIp;
            });
        throw new Error(`No more available IP addresses in the subnet ${prefix}`);
    }
}
