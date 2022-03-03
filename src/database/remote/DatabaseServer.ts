/**
 * Generic remote database server
 * 
 * It wraps a local database and gives read/write access through a stream of messages.
 * It is transport layer and serialization agnostic.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from "events";
import { Database } from "../Database";
import { Record } from "../Record";
import { RESPONSE_CODE } from "./Messages";
import { ServerMessenger, ServerMessengerProvider } from "./ServerMessenger";


export declare interface DatabaseServer {
    on(event: "connection", listener: (count: number) => void): this;
    on(event: "disconnection", listener: (count: number) => void): this;
}

export class DatabaseServer extends EventEmitter {
    private readonly workers = new Map<ServerMessenger, ConnectionWorker>();

    constructor (readonly database: Database, readonly messengerProvider: ServerMessengerProvider) {
        super();
        messengerProvider.on("connection", messenger => this.handleConnection(messenger));
    }

    private handleConnection(messenger: ServerMessenger) {
        const worker = new ConnectionWorker(this.database, messenger);
        this.workers.set(messenger, worker);
        messenger.on("disconnection", () => this.handleDisconnection(messenger));
        this.emit("connection", this.workers.size);
    }

    private handleDisconnection(messenger: ServerMessenger) {
        this.workers.delete(messenger);
        this.emit("disconnection", this.workers.size);
    }
}

class ConnectionWorker {
    private readonly connectedRecords = new Map<string, Record<any>>();
    private readonly disableUpdateNotifications = new Map<string, boolean>();

    constructor(readonly database: Database, readonly messenger: ServerMessenger) {
        messenger.on("connect_record", key => this.handleConnectRequest(key));
        messenger.on("update_record", (key, value) => this.handleUpdateRequest(key, value));
        messenger.on("disconnect_record", key => this.handleDisconnectRequest(key));
        messenger.on("disconnection", () => this.handleDisconnection());
    }

    private async handleConnectRequest(key: string) {
        var record = this.connectedRecords.get(key);
        if (record === undefined) {
            record = await this.database.getRecord(key);
            record.on("update", value => this.handleLocalUpdate(key, value));
            this.connectedRecords.set(key, record);
        }
        this.messenger.sendConnectResponse(RESPONSE_CODE.OK, record.get());
    }

    private async handleUpdateRequest(key: string, value?: any) {
        var record = this.connectedRecords.get(key);
        if (record === undefined) {
            this.messenger.sendUpdateResponse(RESPONSE_CODE.NOT_FOUND);
            return;
        }
        this.disableUpdateNotifications.set(key, true);
        const newValue = await record.set(value);
        this.disableUpdateNotifications.delete(key);
        this.messenger.sendUpdateResponse(RESPONSE_CODE.OK, newValue);
    }

    private handleLocalUpdate(key: string, value?: any) {
        if (this.disableUpdateNotifications.has(key)) return;
        this.messenger.sendUpdate(key, value);
    }

    private handleDisconnectRequest(key: string) {
        var record = this.connectedRecords.get(key);
        if (record !== undefined) {
            record.close();
            this.connectedRecords.delete(key);
        }
        this.messenger.sendDisconnectResponse(RESPONSE_CODE.OK);
    }

    private handleDisconnection() {
        this.connectedRecords.forEach(record => record.close());
    }
}