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

import { Device, DHCPServer, DHCP_SERVER_EVENTS } from "./dhcp/DHCPServer";
import { SocketApi } from "./DaemonSocketAPI";
import { DaemonAPI, DeviceWithState as DeviceInfo, State } from "./DaemonAPI";
import { Settings } from "./utils/Settings";
import { recordMap } from "./utils/ObjectUtils";
import { getSubnet, Subnet } from "./subnet/Subnet";

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

const UNGATED_SUBNET: Subnet = getSubnet({mask: SUBNET_MASK, dhcp: dhcpIp, router: routerIp, dns: routerIp});
const GATED_SUBNET: Subnet = getSubnet({mask: SUBNET_MASK, dhcp: dhcpIp, router: dhcpIp, dns: routerIp});

type DeviceConf = {
    mac: string,
    name: string,
    state: State,
};

class Daemon implements DaemonAPI {
    private readonly settings = new Settings("daemon");
    private readonly devices = this.settings.getSetting<Record<string, DeviceConf>>("devices");
    private readonly dhcpServer = new DHCPServer({
        defaultSubnet: UNGATED_SUBNET,
        subnetPerMac: recordMap(this.devices, ({state}) => state === State.GATED ? GATED_SUBNET : UNGATED_SUBNET),
    });
    private readonly socketApi = new SocketApi(this);

    constructor() {
        this.dhcpServer.on(DHCP_SERVER_EVENTS.NEW_DEVICE, device => this.handleNewDevice(device));
        this.dhcpServer.on(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device => this.handleDeviceUpdate(device));
    }

    start() {
        this.dhcpServer.start();
        this.socketApi.start();
    }

    listDevices(): DeviceInfo[] {
        return this.dhcpServer.getDevices().map(device => ({
            name: this.devices[device.mac].name,
            device,
            state: device.subnet == UNGATED_SUBNET ? State.UNGATED : State.GATED}));
    }

    gateDevice(deviceMac: string): void {
        this.dhcpServer.switchSubnet(deviceMac, GATED_SUBNET);
        this.devices[deviceMac].state = State.GATED;
        this.settings.save();
    }

    ungateDevice(deviceMac: string): void {
        this.dhcpServer.switchSubnet(deviceMac, UNGATED_SUBNET);
        this.devices[deviceMac].state = State.UNGATED;
        this.settings.save();
    }

    renameDevice(deviceMac: string, newName: string): void {
        this.devices[deviceMac].name = newName;
        this.settings.save();
    }

    private handleNewDevice(device: Device) {
        console.log(`New device joined the network: ${JSON.stringify(device)}`)
        const { mac, hostname } = device;
        this.devices[mac] = { mac, name: hostname ?? mac, state: State.UNGATED };
        this.settings.save();
    }

    private handleDeviceUpdate(device: Device) {
        console.log(`Device info updated: ${JSON.stringify(device)}`)
    }
}

console.log(`Starting DHCP server for the subnet ${JSON.stringify(UNGATED_SUBNET)}`);
new Daemon().start();
