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
import { CLIENT_MESSAGE_MAP, SERVER_MESSAGE_MAP, RESPONSE_CODE, DATABASE_RPC, DATABASE_REQUEST_MAP, DATABASE_RESPONSE_MAP } from "./Messages";

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
        return (await this.request("connect", { key })).value;
    }

    async requestUpdate<T>(key: string, value?: T): Promise<T | undefined> {
        return (await this.request("update", { key, value })).value;
    }

    async requestDisconnect(key: string): Promise<void> {
        await this.request("disconnect", { key });
    }

    async close() {
        await this.stream.close();
    }

    private async request<RPC extends keyof DATABASE_RPC>(rpc: RPC, request: DATABASE_REQUEST_MAP[RPC]): Promise<DATABASE_RESPONSE_MAP[RPC]> {
        const response = await this.stream.request(rpc, request, rpc);
        if (response.code !== RESPONSE_CODE.OK) {
            throw new Error(`Reponse error: ${response.code}`);
        }
        return response;
    }

    private handleRemoteUpdate({key, value}: SERVER_MESSAGE_MAP["remote_update"]) {
        this.emit("remote_update", key, value);
    }
}
