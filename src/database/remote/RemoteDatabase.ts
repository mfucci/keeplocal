/**
 * Database connecting to a remote database.
 * 
 * It is transport layer / serialization agnostic.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Record } from "../Record";
import { Database } from "../Database";
import { ClientMessenger } from "./ClientMessenger";

export enum REMOTE_DATABASE_EVENTS {
    DISCONNECTED = "disconnected",
}

export declare interface RemoteDatabase {
    on(event: REMOTE_DATABASE_EVENTS.DISCONNECTED, listener: () => void): this;
}

export class RemoteDatabase extends Database {

    private cache = new Map<string, any>();

    constructor(readonly messenger: ClientMessenger) {
        super();
        messenger.on("remote_update", (key, value) => this.handleRemoteUpdate(key, value));
        messenger.on("disconnected", () => this.emit(REMOTE_DATABASE_EVENTS.DISCONNECTED));
    }

    async getRecord<T>(key: string): Promise<Record<T>> {
        if (!this.cache.has(key)) {
            const value = await this.messenger.requestConnect(key);
            this.cache.set(key, value);
        }
        return this.createRecord<T>(key);
    }

    async close() {
        await this.messenger.close();
    }

    protected getInternal<T>(record: Record<T>): T | undefined {
        const { key } = record;
        return this.cache.get(key);
    }

    protected async setInternal<T>(record: Record<T>, value?: T | undefined) {
        const { key } = record;
        const remoteValue = await this.messenger.requestUpdate(key, value);
        this.cache.set(key, remoteValue);
        this.emitUpdate(key, value);
        return value;
    }

    private handleRemoteUpdate(key: string, value: any) {
        this.cache.set(key, value);
        this.emitUpdate(key, value);
    }

    protected async closeRecord<T>(record: Record<T>) {
        const { key } = record;
        const remainingRecordsForKey = await super.closeRecord(record);
        if (remainingRecordsForKey === 0) {
            await this.messenger.requestDisconnect(record.key);
            this.cache.delete(key);
        }
        return remainingRecordsForKey;
    }
}
