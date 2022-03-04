/**
 * keeplocal deamon to control local device connectivity.
 * 
 * It launches a DHCP server to be able to modify selectively how a device can reach Internet.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { WebsocketDatabaseServer } from "../database/remote/WebsocketDatabaseServer";
import { Device, DHCPServer, DHCP_SERVER_EVENTS } from "../dhcp/DHCPServer";
import { NetworkDevice, NetworkDevicesDatabase, State } from "./NetworkDevices";
import { getSubnet, Subnet, SUBNET_MASK } from "../subnet/Subnet";
import { recordMap } from "../utils/ObjectUtils";
import { Settings } from "../utils/Settings";
import { HTTPServer } from "../http/HTTPServer";

type DeviceConf = {
    mac: string,
    name: string,
    state: State,
};

export class Daemon {
    private readonly ungatedSubnet: Subnet;
    private readonly gatedSubnet: Subnet;
    private readonly settings = new Settings("daemon");
    private readonly devices = this.settings.getSetting<Record<string, DeviceConf>>("devices");
    private readonly dhcpServer: DHCPServer;
    private readonly httpServer: HTTPServer;
    private readonly database = new NetworkDevicesDatabase();
    private readonly databaseServer = new WebsocketDatabaseServer(this.database, 3432);

    constructor(routerIp: string, dhcpIp: string) {
        this.database.on("name_update", (deviceId, name) => this.renameDevice(deviceId, name));
        this.database.on("state_update", (deviceId, state) => this.updateState(deviceId, state));

        this.ungatedSubnet = getSubnet({mask: SUBNET_MASK, dhcp: dhcpIp, router: routerIp, dns: routerIp});
        this.gatedSubnet = getSubnet({mask: SUBNET_MASK, dhcp: dhcpIp, router: dhcpIp, dns: routerIp});

        this.dhcpServer = new DHCPServer({
            defaultSubnet: this.ungatedSubnet,
            subnetPerMac: recordMap(this.devices, ({state}) => state === State.GATED ? this.gatedSubnet : this.ungatedSubnet),
        });
        this.dhcpServer.on(DHCP_SERVER_EVENTS.NEW_DEVICE, device => this.handleNewDevice(device));
        this.dhcpServer.on(DHCP_SERVER_EVENTS.UPDATE_DEVICE, device => this.handleDeviceUpdate(device));

        this.httpServer = new HTTPServer(8080);
    }

    start() {
        console.log(`Starting DHCP server for the subnet ${JSON.stringify(this.ungatedSubnet)}`);
        this.dhcpServer.start();
        this.httpServer.start();
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
        //this.dhcpServer.switchSubnet(id, this.gatedSubnet);
        this.devices[id].state = State.GATED;
        this.settings.save();
    }

    ungateDevice(id: string): void {
        console.log(`ungateDevice ${id}`);
        //this.dhcpServer.switchSubnet(id, this.ungatedSubnet);
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
