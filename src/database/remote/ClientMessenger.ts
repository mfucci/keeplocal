/**
 * Remote database client messenger
 * 
 * It converts commands and events into a bi-direction stream of messages.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from "events";
import { MessageStream } from "../../stream/MessageStream";
import { CLIENT_MESSAGE_MAP, SERVER_MESSAGE_MAP, RESPONSE_CODE } from "./Messages";

export interface ClientMessengerEventMap {
    "remote_update": [key: string, value: any],
    "disconnected": [],
}

export declare interface ClientMessenger {
    on<K extends keyof ClientMessengerEventMap>(event: K, listener: (...value: ClientMessengerEventMap[K]) => void): this;
    emit<K extends keyof ClientMessengerEventMap>(event: K, ...value: ClientMessengerEventMap[K]): boolean;
}

export class ClientMessenger extends EventEmitter {

    constructor(private readonly stream: MessageStream<SERVER_MESSAGE_MAP, CLIENT_MESSAGE_MAP>) {
        super();
        this.stream.on("closed", () => this.emit("disconnected"));
        this.stream.on("remote_update", message => this.handleRemoteUpdate(message));
    }

    async requestConnect<T>(key: string): Promise<T | undefined> {
        return (await this.send("connect", { key })).value;
    }

    async requestUpdate<T>(key: string, value?: T): Promise<T | undefined> {
        return (await this.send("update", { key, value })).value;
    }

    async requestDisconnect(key: string): Promise<void> {
        await this.send("disconnect", { key });
    }

    async close() {
        await this.stream.close();
    }

    private async send<REQUEST_T extends keyof CLIENT_MESSAGE_MAP>(requestType: REQUEST_T, request: CLIENT_MESSAGE_MAP[REQUEST_T]): Promise<SERVER_MESSAGE_MAP[REQUEST_T]> {
        await this.stream.write(requestType, request);
        const response = await this.stream.read(requestType);
        if (response.code !== RESPONSE_CODE.OK){
            throw new Error(`Reponse error: ${response.code}`);
        }
        return response;
    }

    private handleRemoteUpdate({key, value}: SERVER_MESSAGE_MAP["remote_update"]) {
        this.emit("remote_update", key, value);
    }
}
