/**
 * Local database using provided records to store the data.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Record } from "./Record";
import { Database } from "./Database";
import EventEmitter from "events";

interface InternalRecordMap<T> {
    "update": T | undefined;
}

export declare interface InternalRecord<T> {
    on<K extends keyof InternalRecordMap<T>>(event: K, listener: (value: InternalRecordMap<T>[K]) => void): this;
    once<K extends keyof InternalRecordMap<T>>(event: K, listener: (value: InternalRecordMap<T>[K]) => void): this;
    emit<K extends keyof InternalRecordMap<T>>(event: K, value: InternalRecordMap<T>[K]): boolean;
} 

export class InternalRecord<T> extends EventEmitter {
    private value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    get(): T {
        return this.value;
    }

    set(value: T) {
        this.value = value;
        this.emit("update", value);
    }
}

export class RecordDatabase extends Database {
    private readonly internalRecords = new Map<string, InternalRecord<any>>();

    constructor() {
        super();
    }

    async getRecord<T>(key: string): Promise<Record<T>> {
        return this.createRecord<T>(key);
    }

    protected getInternal<T>(record: Record<T>): T | undefined {
        const internalRecord = this.internalRecords.get(record.key);
        return internalRecord?.get();
    }

    protected async setInternal<T>(record: Record<T>, value?: T) {
        const internalRecord = this.internalRecords.get(record.key);
        internalRecord?.set(value);
        return internalRecord?.get();
    }

    setInternalRecord(key: string, record: InternalRecord<any>) {
        const previousRecord = this.internalRecords.get(key);
        if (previousRecord !== undefined) {
            previousRecord.removeAllListeners("update");
        }
        this.internalRecords.set(key, record);
        record.on("update", value => this.emitUpdate(key, value));
        this.emitUpdate(key, record.get());
    }

    getInternalRecord(key: string) {
        return this.internalRecords.get(key);
    }
}
