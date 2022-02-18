#!/usr/bin/env node

/**
 * keeplocal deamon to control local device connectivity.
 * 
 * It launches a DHCP server to be able to modify selectively how a device can reach Internet.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as ip from "ip";
import * as gateway from "default-gateway";
import yargs from "yargs";

import { DHCPServer, DHCP_SERVER_EVENTS, Subnet } from "./dhcp/DHCPServer";
import { SocketApi } from "./DaemonSocketAPI";
import { DaemonAPI, DeviceWithState, State } from "./DaemonAPI";
import { Settings } from "./utils/Settings";
import { recordMap } from "./utils/ObjectUtils";

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

const UNGATED_SUBNET: Subnet = {mask: SUBNET_MASK, dhcp: dhcpIp, router: routerIp, dns: routerIp};
const GATED_SUBNET: Subnet = {mask: SUBNET_MASK, dhcp: dhcpIp, router: dhcpIp, dns: routerIp};

function subnetEqual(subnet1: Subnet, subnet2: Subnet) {
    return subnet1.mask ==  subnet2.mask && subnet1.dhcp == subnet2.dhcp && subnet1.router == subnet2.router && subnet1.dns == subnet2.dns;
}

class Daemon implements DaemonAPI {
    private readonly settings = new Settings("daemon");
    private readonly gatedDevices = this.settings.getSetting<Record<string, State>>("gatedDevices");
    private readonly dhcpServer = new DHCPServer({
        default: UNGATED_SUBNET,
        perMacDevice: recordMap(this.gatedDevices, state => state === State.GATED ? GATED_SUBNET : UNGATED_SUBNET),
    });
    private readonly socketApi = new SocketApi(this);

    constructor() {
        this.dhcpServer.on(DHCP_SERVER_EVENTS.NEW_DEVICE, device => console.log(`New device joined the network: ${JSON.stringify(device)}`));
        this.dhcpServer.on(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device => console.log(`Device info updated: ${JSON.stringify(device)}`));
    }

    start() {
        this.dhcpServer.start();
        this.socketApi.start();
    }

    listDevices(): DeviceWithState[] {
        return this.dhcpServer.getDevices().map(device => ({device, state: subnetEqual(device.subnet, UNGATED_SUBNET) ? State.UNGATED : State.GATED}));
    }

    gateDevice(deviceMac: string): void {
        this.dhcpServer.switchSubnet(deviceMac, GATED_SUBNET);
        this.gatedDevices[deviceMac] = State.GATED;
        this.settings.save();
    }

    ungateDevice(deviceMac: string): void {
        this.dhcpServer.switchSubnet(deviceMac, UNGATED_SUBNET);
        delete this.gatedDevices[deviceMac];
        this.settings.save();
    }
}

console.log(`Starting DHCP server for the subnet ${JSON.stringify(UNGATED_SUBNET)}`);
new Daemon().start();
