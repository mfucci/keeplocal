import EventEmitter = require("events");
import arp from "@network-utils/arp-lookup";
import * as macAddressHelper from "macaddress";
import * as ip from "ip";

import { DHCPServerMessenger, Request } from "./DHCPMessenger";

export class Subnet {
    readonly leaseTimeSeconds = 5 * 60 /* 5 minutes */;

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
    mac: string;
    ip: string;
    readonly ipType: IpType;
    hostname?: string;
    classId?: string;
    displayName: string;

    constructor(
        displayName: string,
        mac: string,
        ip: string,
        hostName: string,
        vendorClassIdentifier: string,
        ipType: IpType) {
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
        this.createDevice(routerIp, { mac: await arp.toMAC(routerIp), hostname: "router", staticIp: true});
        this.createDevice(dhcpIp, { mac: await macAddressHelper.one(), hostname: "dhcp", staticIp: true});
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
        this.deviceByIp.set(device.ip, device);
        this.subnetByDevice.set(device, subnet);
    }

    private handleDiscover(request: Request) {
        const device = this.getDevice(request);
        this.messenger.sendOffer(request, device, this.subnetByDevice.get(device));
    }

    private handleRequest(request: Request) {
        const device = this.getDevice(request);
        const addressRequested = request.ip !== undefined ? request.ip : request.requestedIp;
        if (addressRequested !== device.ip) {
            this.messenger.sendNak(request, device, this.subnetByDevice.get(device));
        } else {
            this.messenger.sendAck(request, device, this.subnetByDevice.get(device));
        }
    }

    private getDevice(request: Request): Device {
        const { mac, hostname, classId } = request;
    
        var device = this.deviceByMac.get(mac);
        if (device === undefined) {
            device = this.createDevice(this.assignIp(this.defaultSubnet), { mac, hostname, classId });
        } else {
           this.updateDevice(device, { hostname, classId});
        }
        return device;
    }

    private createDevice(ip: string, { mac, hostname, classId, staticIp }: { mac: string, hostname?: string, classId?: string, staticIp?: boolean}) {
        const subnet = this.defaultSubnet;
        const displayName = (hostname !== undefined) ? hostname : mac;
        const device = new Device(displayName, mac, ip, hostname, classId, staticIp ? IpType.STATIC : IpType.DHCP);
        this.emit(DHCP_SERVER_EVENTS.NEW_DEVICE, device);
        this.deviceByIp.set(ip, device);
        this.deviceByMac.set(mac, device);
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
                throw new Error(`No more available IP addresses in the subnet ${prefix}`);
            }
        }
    }
}
