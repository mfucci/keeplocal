/**
 * Socket-based API for the daemon.
 * 
 * Supported commands:
 * <li>list
 * <li>gate <device_mac>
 * <li>free <device_mac>
 * 
 * @see DaemonAPI for command details
 */

import yargs from "yargs";  
import * as net from "net";
import { DaemonAPI } from "./DaemonAPI";

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
    private readonly commandParser = yargs({})
        .command("list", "List devices", {}, () => this.handleListDevices())
        .command("gate <deviceMac>", "Gate device cloud connectivity", yargs => yargs.positional("deviceMac", {type: "string", describe: "Mac address"}), ({deviceMac}) => this.handleGateDevice(deviceMac))
        .command("free <deviceMac>", "Free device cloud connectivity", yargs => yargs.positional("deviceMac", {type: "string", describe: "Mac address"}), ({deviceMac}) => this.handleFreeDevice(deviceMac))
        .demandCommand();

    constructor(readonly daemonAPI: DaemonAPI, readonly socket: net.Socket) {
        socket.on("data", buffer => socket.write(this.handleSocketData(buffer)));
    }

    private handleSocketData(data: Buffer): string {
        const command = data.toString().slice(0, -1); // Remove trailing \n
        this.commandParser.parseSync(command.split(" "), {}, (err, argv, output) => {
            if (output != "") this.reply.push(output);
        });

        const response = this.reply.join("\n");
        this.reply.length = 0;
        return response;
    }
        
    private handleListDevices() {
        try {
            const devices = this.daemonAPI.listDevices();
            this.reply.push("IP\t\tMAC\t\t\tName\thostname\tclassId\t");
            devices.forEach(({device, status}) => this.reply.push(`${device.ip}\t${device.mac}\t${device.displayName}\t${device.hostname}\t${device.classId}\t${status}`));
        } catch (error) {
            this.handleError(error);
        }
    }
    
    private handleGateDevice(mac: string) {
        try {
            this.daemonAPI.gateDevice(mac);
            this.reply.push("Done");
        } catch (error) {
            this.handleError(error);
        }
    }
    
    private handleFreeDevice(mac: string) {
        try {
            this.daemonAPI.gateDevice(mac);
            this.reply.push("Done");
        } catch (error) {
            this.handleError(error);
        }
    }

    private handleError(error: Error) {
        console.error(`Error during the execution of the command: ${error}`);
        this.reply.push(error.message);
    }
}
