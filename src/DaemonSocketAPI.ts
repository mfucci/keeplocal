/**
 * Socket-based API for the daemon.
 * 
 * Supported commands:
 * <li>list
 * <li>gate <device_mac>
 * <li>ungate <device_mac>
 * 
 * @see DaemonAPI for command details
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from "yargs";  
import * as net from "net";
import { DaemonAPI } from "./DaemonAPI";
import table from "text-table";
import { format } from "timeago.js";
import { isRandomMac, vendorForMac } from "./utils/MacUtils";

export const HOSTNAME = "localhost";
export const PORT = 3432;

export class SocketApi {
    private readonly server = net.createServer();

    constructor(readonly daemonAPI: DaemonAPI) {
        this.server.on("connection", socket => new SocketAPIHandler(daemonAPI, socket));
    }

    start() {
        this.server.listen(PORT, HOSTNAME);
    }
}

class SocketAPIHandler {
    private readonly reply = new Array<string>();
    private readonly commandParser = yargs([])
        .command("list", "List devices", {}, () => this.handleListDevices())
        .command("gate <deviceMac>", "Gate device cloud connectivity", yargs => yargs.positional("deviceMac", {type: "string", describe: "Mac address"}), ({deviceMac}) => this.handleGateDevice(deviceMac as string))
        .command("ungate <deviceMac>", "Ungate device cloud connectivity", yargs => yargs.positional("deviceMac", {type: "string", describe: "Mac address"}), ({deviceMac}) => this.handleUngateDevice(deviceMac as string))
        .demandCommand();

    constructor(readonly daemonAPI: DaemonAPI, readonly socket: net.Socket) {
        socket.on("data", buffer => socket.write(this.handleSocketData(buffer)));
    }

    private handleSocketData(data: Buffer): string {
        const command = JSON.parse(data.toString());
        this.commandParser.parse(command, {}, (err, argv, output) => {
            if (output != "") this.reply.push(output);
        });

        const response = this.reply.join("\n") + "\n";
        this.reply.length = 0;
        return response;
    }
        
    private handleListDevices() {
        try {
            const devices = this.daemonAPI.listDevices();
            this.reply.push(table([
                ["IP Type", "IP", "MAC", "Hostname", "ClassId", "State", "Pending", "Last Seen"],
                ...devices.map(({
                    device: {
                        ip = "<none>",
                        ipType,
                        mac,
                        hostname = "<none>",
                        classId = "<none>",
                        pendingChanges,
                        lastSeen,
                        vendor,
                    },
                    state
                }) => [
                    ipType,
                    ip,
                    `${mac} (${vendor})`,
                    hostname,
                    classId,
                    state,
                    pendingChanges,
                    lastSeen ? format(lastSeen) : "N/A"]),
            ]));
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private handleGateDevice(mac: string) {
        try {
            this.daemonAPI.gateDevice(mac);
            this.reply.push("Done");
        } catch (error) {
            this.handleError(error as Error);
        }
    }
    
    private handleUngateDevice(mac: string) {
        try {
            this.daemonAPI.ungateDevice(mac);
            this.reply.push("Done");
        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private handleError(error: Error) {
        console.error(`Error during the execution of the command: ${error.message}\n${error.stack}`);
        this.reply.push(error.message);
    }
}
