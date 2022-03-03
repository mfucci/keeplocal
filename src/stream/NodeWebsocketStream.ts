/**
 * Stream using a ws (node) websocket for the transport.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Queue } from "./Queue";
import { Stream } from "./Stream";
import { WebSocket }  from "ws";

export class WebsocketStream extends Stream<string> {
    private receiveQueue = new Queue<string>();

    static async fromUrl(url: string) {
        return new Promise<WebsocketStream>((resolve, reject) => {
            const socket = new WebSocket(url);
            socket.once("open", () => resolve(new WebsocketStream(socket)));
            socket.once("error", error => reject(error));

        });
    }

    constructor(private readonly socket: WebSocket) {
        super();
        this.socket.on("message", message => this.receiveQueue.write(message.toString()));
        this.socket.once("close", () => this.close());
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
