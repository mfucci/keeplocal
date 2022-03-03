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
import { Settings } from "./utils/Settings";
import { recordMap } from "./utils/ObjectUtils";
import { getSubnet, Subnet } from "./subnet/Subnet";
import { WebsocketDatabaseServer } from "./database/remote/WebsocketDatabaseServer";
import { NetworkDevice, NetworkDevicesDatabase, State } from "./NetworkDevices";

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

class Daemon {
    private readonly settings = new Settings("daemon");
    private readonly devices = this.settings.getSetting<Record<string, DeviceConf>>("devices");
    private readonly dhcpServer = new DHCPServer({
        defaultSubnet: UNGATED_SUBNET,
        subnetPerMac: recordMap(this.devices, ({state}) => state === State.GATED ? GATED_SUBNET : UNGATED_SUBNET),
    });
    private readonly database = new NetworkDevicesDatabase();
    private readonly databaseServer = new WebsocketDatabaseServer(this.database, 3432);

    constructor() {
        this.dhcpServer.on(DHCP_SERVER_EVENTS.NEW_DEVICE, device => this.handleNewDevice(device));
        this.dhcpServer.on(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device => this.handleDeviceUpdate(device));
        this.database.on("name_update", (deviceId, name) => this.renameDevice(deviceId, name));
        this.database.on("state_update", (deviceId, state) => this.updateState(deviceId, state));
    }

    start() {
        this.dhcpServer.start();
        this.database.setDevices(this.dhcpServer.getDevices().map(device => this.toNetworkDevice(device)));
    }

    private updateState(deviceId: string, state: State) {
        switch (state) {
            case State.GATED:
                this.gateDevice(deviceId);
                break;
            case State.UNGATED:
                this.ungateDevice(deviceId);
                break;
        }
    }

    gateDevice(id: string): void {
        console.log(`gateDevice ${id}`);
        this.dhcpServer.switchSubnet(id, GATED_SUBNET);
        this.devices[id].state = State.GATED;
        this.settings.save();
    }

    ungateDevice(id: string): void {
        console.log(`ungateDevice ${id}`);
        this.dhcpServer.switchSubnet(id, UNGATED_SUBNET);
        this.devices[id].state = State.UNGATED;
        this.settings.save();
    }

    renameDevice(id: string, name: string): void {
        console.log(`renameDevice ${id} ${name}`);
        this.devices[id].name = name;
        this.settings.save();
    }

    private handleNewDevice(device: Device) {
        console.log(`New device joined the network: ${JSON.stringify(device)}`);
        const { mac, hostname } = device;
        this.devices[mac] = { mac, name: hostname ?? mac, state: State.UNGATED };
        this.database.updateDevice(this.toNetworkDevice(device));
        this.settings.save();
    }

    private handleDeviceUpdate(device: Device) {
        console.log(`Device info updated: ${JSON.stringify(device)}`)
        this.database.updateDevice(this.toNetworkDevice(device));
    }

    private toNetworkDevice({ip, ipType, mac, pendingChanges, vendor, classId, hostname, lastSeen}: Device): NetworkDevice {
        const deviceId = mac;
        const deviceConf = this.devices[deviceId];
        if (deviceConf === undefined) throw new Error(`Missing device conf for ${deviceId}`);
        const { state, name } = deviceConf;
        return { mac, state, name, ip, ipType, pendingChanges, vendor, classId, hostname, lastSeen };
    }
}

console.log(`Starting DHCP server for the subnet ${JSON.stringify(UNGATED_SUBNET)}`);
new Daemon().start();
