/**
 * Remote database server messenger
 * 
 * It converts commands and events into a bi-direction stream of messages.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from "events";
import { MessageStream } from "../../stream/MessageStream";
import { CLIENT_MESSAGE_MAP, RESPONSE_CODE, SERVER_MESSAGE_MAP } from "./Messages";

export declare interface ServerMessengerProvider {
    on(event: "connection", listener: (messenger: ServerMessenger) => void): this;
}

export interface ServerMessengerProvider {
}

interface ServerMessengerEventMap {
    "connect_record": [requestId: number, key: string],
    "update_record": [requestId: number, key: string, value: any],
    "disconnect_record": [requestId: number, key: string],
    "disconnection": [],
}

export declare interface ServerMessenger {
    on<K extends keyof ServerMessengerEventMap>(event: K, listener: (...value: ServerMessengerEventMap[K]) => void): this;
    emit<K extends keyof ServerMessengerEventMap>(event: K, ...value: ServerMessengerEventMap[K]): boolean;
}

export class ServerMessenger extends EventEmitter {
    constructor(readonly stream: MessageStream<CLIENT_MESSAGE_MAP, SERVER_MESSAGE_MAP>) {
        super();
        this.stream.on("connect_request", ({key}, requestId) => this.emit("connect_record", requestId, key));
        this.stream.on("update_request", ({key, value}, requestId) => this.emit("update_record", requestId, key, value));
        this.stream.on("disconnect_request", ({key}, requestId) => this.emit("disconnect_record", requestId, key));
        this.stream.on("closed", () => this.handleStreamClosed());
    }

    async sendConnectResponse(requestId: number, code: RESPONSE_CODE, value?: any) {
        await this.stream.respond("connect", requestId, { code, value });
    }

    async sendUpdateResponse(requestId: number, code: RESPONSE_CODE, value?: any) {
        await this.stream.respond("update", requestId, { code, value });
    }

    async sendDisconnectResponse(requestId: number, code: RESPONSE_CODE) {
        await this.stream.respond("disconnect", requestId, { code });
    }

    async sendUpdate(key: string, value?: any) {
        await this.stream.write("remote_update", { key, value });
    }

    private handleStreamClosed() {
        this.emit("disconnection");
    }
}
