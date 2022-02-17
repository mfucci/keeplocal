#!/usr/bin/env node

/**
 * Command line interface to communicate with keeplocal Daemon.
 * 
 * It connects to a local keeplocal daemon listening on port 3432.
 * 
 * @see DaemonSocketAPI for command details
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as net from "net";
import { HOSTNAME, PORT } from "./DaemonSocketAPI";

const socket = net.createConnection({host: HOSTNAME, port: PORT, timeout: 1000});
socket.on("connect", () => {
    socket.write(JSON.stringify(process.argv.splice(2)) + "\n");
    socket.on("data", buffer => {
        console.log(buffer.toString());
        socket.end();
    });
});
socket.on("error", error => console.error(`${error.name}: ${error.message}`));
socket.on("timeout", () => {
    console.log("A timeout occured while waiting for a reply");
    socket.end();
});