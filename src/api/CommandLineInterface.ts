#!/usr/bin/env node

/**
 * Command line interface to communicate with keeplocal Daemon.
 * 
 * It connects to a local keeplocal daemon over a websocket on port 3432.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from "yargs";
import { JSONRemoteDatabase } from "../database/remote/JSONRemoteDatabase";
import { NetworkDevice, State } from "../NetworkDevices";
import { WebsocketStream } from "../stream/NodeWebsocketStream";
import table from "text-table";
import { format } from "timeago.js";

async function handleListDevices() {
    const remoteDatabase = new JSONRemoteDatabase(await WebsocketStream.fromUrl("ws://localhost:3432/"));
    const deviceIds = await remoteDatabase.get<string[]>("/devices");
    if (deviceIds === undefined) throw new Error("Missing device IDs");
    const devices = new Array<NetworkDevice>();
    for (var i = 0; i < deviceIds.length; i++) {
        var device = await remoteDatabase.get<NetworkDevice>(`/device/${deviceIds[i]}`);
        if (device === undefined) continue;
        devices.push(device);
    }
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
    await remoteDatabase.close();
}

async function handleGateDevice(deviceId: string) {
    const remoteDatabase = new JSONRemoteDatabase(await WebsocketStream.fromUrl("ws://localhost:8080/"));
    const record = await remoteDatabase.getRecord<NetworkDevice>(`/device/${deviceId}`);
    const device = record.get();
    if (device === undefined) throw new Error(`Unknown device ${deviceId}`);
    device.state = State.GATED;
    await record.set(device);
    await remoteDatabase.close();
}

async function handleUngateDevice(deviceId: string) {
    const remoteDatabase = new JSONRemoteDatabase(await WebsocketStream.fromUrl("ws://localhost:8080/"));
    const record = await remoteDatabase.getRecord<NetworkDevice>(`/device/${deviceId}`);
    const device = record.get();
    if (device === undefined) throw new Error(`Unknown device ${deviceId}`);
    device.state = State.UNGATED;
    await record.set(device);
    await remoteDatabase.close();

}

async function handleRenameDevice(deviceId: string, name: string) {
    const remoteDatabase = new JSONRemoteDatabase(await WebsocketStream.fromUrl("ws://localhost:8080/"));
    const record = await remoteDatabase.getRecord<NetworkDevice>(`/device/${deviceId}`);
    const device = record.get();
    if (device === undefined) throw new Error(`Unknown device ${deviceId}`);
    device.name = name;
    await record.set(device);
    await remoteDatabase.close();
}

const argv = yargs
    .scriptName("keeplocal")
    .command("list", "List devices", {}, () => handleListDevices())
    .command("gate <deviceMac>",
        "Gate device cloud connectivity",
        yargs => yargs.positional("deviceMac", {type: "string", describe: "Mac address"}),
        ({deviceMac}) => handleGateDevice(deviceMac as string))
    .command("ungate <deviceMac>",
        "Ungate device cloud connectivity",
        yargs => yargs.positional("deviceMac", {type: "string", describe: "Mac address"}),
        ({deviceMac}) => handleUngateDevice(deviceMac as string))
    .command("rename <deviceMac> <name>",
        "Rename a device",
        yargs => yargs
            .positional("deviceMac", {type: "string", describe: "Mac address"})
            .positional("name", {type: "string", describe: "New name"}),
        ({deviceMac, name}) => handleRenameDevice(deviceMac as string, name as string))
    .demandCommand()
    .argv;
