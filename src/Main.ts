#!/usr/bin/env node

/**
 * keeplocal main entry point.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as ip from "ip";
import * as gateway from "default-gateway";
import yargs from "yargs";
import table from "text-table";
import { format } from "timeago.js";

import { Daemon } from "./daemon/Daemon";
import { SUBNET_MASK } from "./subnet/Subnet";
import { JSONRemoteDatabase } from "./database/remote/JSONRemoteDatabase";
import { WebsocketStream } from "./stream/NodeWebsocketStream";
import { NetworkDevice, State } from "./daemon/NetworkDevices";
import { Database } from "./database/Database";

class CommandLineHandler {
    private database?: Database;

    async listDevices() {
        const devices = await this.getDevices();
        console.log(table([
            [
                "Name",
                "IP",
                "MAC",
                "State",
                "Hostname",
                "ClassID",
                "Changes Pending",
                "Last seen",
            ],
            ...devices.map(({
                name,
                ip,
                ipType,
                mac,
                vendor,
                state,
                pendingChanges,
                classId,
                hostname,
                lastSeen,
            }) => [
                name,
                `${ip} (${ipType})`,
                `${mac} (${vendor})`,
                state,
                hostname ?? "",
                classId ?? "",
                pendingChanges,
                lastSeen ? format(lastSeen) : "N/A"
            ]
        )]));
    }
    
    async gateDevice(deviceId: string) {
        await this.updateDevice(deviceId, { state: State.GATED });
    }
    
    async ungateDevice(deviceId: string) {
        await this.updateDevice(deviceId, { state: State.UNGATED });
    }
    
    async renameDevice(deviceId: string, name: string) {
        await this.updateDevice(deviceId, { name });
    }

    startDaemon(routerIp: string, dhcpIp: string) {
        if (!ip.isV4Format(routerIp)) {
            throw new Error("The router IP should be a v4 IP.");
        }
        if (!ip.isV4Format(dhcpIp)) {
            throw new Error("The DHCP server IP should be a v4 IP.");
        }
        if (!ip.subnet(routerIp, SUBNET_MASK).contains(dhcpIp)) {
            throw new Error("The router and the DHCP server should be on the same subnet");
        }
        
        new Daemon(routerIp, dhcpIp).start();
    }

    private async getRemoteDatabase() {
        return new JSONRemoteDatabase(await WebsocketStream.fromUrl("ws://localhost:3432/"));
    }

    private async getDevices() {
        const remoteDatabase = await this.getRemoteDatabase();
        const deviceIds = await remoteDatabase.get<string[]>("/devices");
        if (deviceIds === undefined) throw new Error("Missing device IDs");
        const devices = new Array<NetworkDevice>();
        for (var i = 0; i < deviceIds.length; i++) {
            var device = await remoteDatabase.get<NetworkDevice>(`/device/${deviceIds[i]}`);
            if (device === undefined) continue;
            devices.push(device);
        }
        await remoteDatabase.close();
        return devices;
    }

    private async updateDevice(deviceId: string, update: Partial<NetworkDevice>) {
        const remoteDatabase = await this.getRemoteDatabase();
        const record = await remoteDatabase.getRecord<NetworkDevice>(`/device/${deviceId}`);
        const device = record.get();
        if (device === undefined) throw new Error(`Unknown device ${deviceId}`);
        await record.set({...device, ...update});
        await remoteDatabase.close();
    }
}

const commandLineHandler = new CommandLineHandler();

yargs
    .scriptName("keeplocal")
    .command("daemon [router] [dhcp]",
        "Start keeplocal daemon (requires root)",
        yargs => yargs
            .positional("router", {type: "string", describe: "Mac address", default: gateway.v4.sync().gateway})
            .positional("dhcp", {type: "string", describe: "New name", default: ip.address()}),
        ({router, dhcp}) => commandLineHandler.startDaemon(router as string, dhcp as string))
    .command("list",
        "List devices",
        {},
        () => commandLineHandler.listDevices())
    .command("gate <deviceMac>",
        "Gate device cloud connectivity",
        yargs => yargs
            .positional("deviceMac", {type: "string", describe: "Mac address"}),
        ({deviceMac}) => commandLineHandler.gateDevice(deviceMac as string))
    .command("ungate <deviceMac>",
        "Ungate device cloud connectivity",
        yargs => yargs
            .positional("deviceMac", {type: "string", describe: "Mac address"}),
        ({deviceMac}) => commandLineHandler.ungateDevice(deviceMac as string))
    .command("rename <deviceMac> <name>",
        "Rename a device",
        yargs => yargs
            .positional("deviceMac", {type: "string", describe: "Mac address"})
            .positional("name", {type: "string", describe: "New name"}),
        ({deviceMac, name}) => commandLineHandler.renameDevice(deviceMac as string, name as string))
    .demandCommand()
    .argv;
