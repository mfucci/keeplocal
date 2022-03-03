/**
 * Stream using a W3C websocket for the transport.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Queue } from "./Queue";
import { Stream } from "./Stream";

export class WebsocketStream extends Stream<string> {
    private receiveQueue = new Queue<string>();
    private socket: WebSocket;

    constructor(url: string) {
        super();
        this.socket = new WebSocket(url);
        this.socket.addEventListener("message", ({data}) => this.receiveQueue.write(data));
        this.socket.addEventListener("close", () => this.close());
    }
    
    async read() {
        return await this.receiveQueue.read();
    }

    async write(message: string) {
        this.socket.send(message);
    }

    async close() {
        this.socket.close();
        this.receiveQueue.close();
        this.emit("closed");
    }
}
