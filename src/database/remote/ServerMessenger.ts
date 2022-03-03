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
    "connect_record": [key: string],
    "update_record": [key: string, value: any],
    "disconnect_record": [key: string],
    "disconnection": [],
}

export declare interface ServerMessenger {
    on<K extends keyof ServerMessengerEventMap>(event: K, listener: (...value: ServerMessengerEventMap[K]) => void): this;
    emit<K extends keyof ServerMessengerEventMap>(event: K, ...value: ServerMessengerEventMap[K]): boolean;
}

export class ServerMessenger extends EventEmitter {
    constructor(readonly stream: MessageStream<CLIENT_MESSAGE_MAP, SERVER_MESSAGE_MAP>) {
        super();
        this.stream.on("connect", ({key}) => this.emit("connect_record", key));
        this.stream.on("update", ({key, value}) => this.emit("update_record", key, value));
        this.stream.on("disconnect", ({key}) => this.emit("disconnect_record", key));
        this.stream.on("closed", () => this.handleStreamClosed());
    }

    async sendConnectResponse(code: RESPONSE_CODE, value?: any) {
        await this.stream.write("connect", { code, value });
    }

    async sendUpdateResponse(code: RESPONSE_CODE, value?: any) {
        await this.stream.write("update", { code, value });
    }

    async sendDisconnectResponse(code: RESPONSE_CODE) {
        await this.stream.write("disconnect", { code });
    }

    async sendUpdate(key: string, value?: any) {
        await this.stream.write("remote_update", { key, value });
    }

    private handleStreamClosed() {
        this.emit("disconnection");
    }
}
