#!/usr/bin/env node

import * as ip from "ip";
import * as gateway from "default-gateway";
import yargs from "yargs";

import { DHCPServer, DHCP_SERVER_EVENTS, Subnet } from "./DHCPServer";
import { SocketApi } from "./DaemonSocketAPI";
import { DaemonAPI, DeviceWithStatus, Status } from "./DaemonAPI";

const { router: routerIp, dhcp: dhcpIp } = yargs(process.argv.slice(2))
    .option({
        router: {desc: "IP of the router", type: "string", default: gateway.v4.sync().gateway, demandOption: true},
        dhcp: {desc: "IP of the DHCP server", type: "string", default: ip.address()},
    }).parseSync();

const SUBNET_MASK = "255.255.255.0";

if (!ip.isV4Format(routerIp)) {
    throw new Error("The router IP should be a v4 IP.");
}
if (!ip.isV4Format(dhcpIp)) {
    throw new Error("The DHCP server IP should be a v4 IP.");
}
if (!ip.subnet(routerIp, SUBNET_MASK).contains(dhcpIp)) {
    throw new Error("The router and the DHCP server should be on the same subnet");
}

const CLOUDED_SUBNET = new Subnet(SUBNET_MASK, dhcpIp, routerIp, routerIp);
const UNCLOUDED_SUBNET = new Subnet(SUBNET_MASK, dhcpIp, dhcpIp, routerIp);

class Daemon implements DaemonAPI {
    private readonly dhcpServer = new DHCPServer(CLOUDED_SUBNET);
    private readonly socketApi = new SocketApi(this);

    constructor() {
        this.dhcpServer.on(DHCP_SERVER_EVENTS.NEW_DEVICE, device => console.log(`New device joined the network: ${JSON.stringify(device)}`));
        this.dhcpServer.on(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device => console.log(`Device info updated: ${JSON.stringify(device)}`));
    }

    start() {
        this.dhcpServer.start();
        this.socketApi.start();
    }

    listDevices(): DeviceWithStatus[] {
        return this.dhcpServer.getDevices().map(({device, subnet}) => ({device, status: subnet === CLOUDED_SUBNET ? Status.FREE : Status.GATED}));
    }

    gateDevice(deviceMac: string): void {
        this.dhcpServer.switchSubnet(this.getDeviceByMac(deviceMac), UNCLOUDED_SUBNET);
    }

    freeDevice(deviceMac: string): void {
        this.dhcpServer.switchSubnet(this.getDeviceByMac(deviceMac), CLOUDED_SUBNET);
    }

    private getDeviceByMac(mac: string) {
        const device = this.dhcpServer.getDeviceByMac(mac);
        if (device === undefined) {
            throw new Error(`Cannot find device with MAC ${mac}`);
        }
        return device;
    }
}

console.log(`Starting DHCP server for the subnet ${JSON.stringify(CLOUDED_SUBNET)}`);
new Daemon().start();