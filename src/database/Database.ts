/**
 * Base class for all database implementations
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Record } from "./Record";
import { deepEqual } from 'fast-equals';
import EventEmitter from "events";
import { deepCopy } from "../utils/ObjectUtils";

export abstract class Database extends EventEmitter {
    private readonly connectedRecords = new Map<string, Record<any>[]>();

    abstract getRecord<T>(key: string): Promise<Record<T>>;

    async set<T>(key: string, value: T | undefined) {
        const record = await this.getRecord<T>(key);
        await record.set(value);
        await record.close();
    }

    async get<T>(key: string): Promise<T | undefined> {
        const record = await this.getRecord<T>(key);
        const value = record.get();
        await record.close();
        return value;
    }

    protected createRecord<T>(key: string) {
        const record = new class extends Record<T> {
            constructor(
                readonly database: Database,
                readonly key: string) {
                super(key);
            }

            get(): T | undefined {
                return deepCopy(this.database.getInternal<T>(this));
            }
    
            async set(value?: T):Promise<T | undefined> {
                const currentValue = this.get();
                if (deepEqual(currentValue, value)) return;
                return this.database.setInternal(this, value);
            }

            async close() {
                await this.database.closeRecord(this);
            }
        }(this, key);
        var records = this.connectedRecords.get(key);
        if (records === undefined) {
            records = [];
            this.connectedRecords.set(key, records);
        }
        records.push(record);
        return record;
    }

    protected abstract getInternal<T>(record: Record<T>): T | undefined;
    
    protected abstract setInternal<T>(record: Record<T>, value?: T | undefined): Promise<T | undefined>;

    protected emitUpdate<T>(key: string, value?: T) {
        this.connectedRecords.get(key)?.forEach(record => record.emit("update", value));
    }

    protected async closeRecord<T>(record: Record<T>): Promise<number> {
        const { key } = record;
        const records = this.connectedRecords.get(key);
        if (records === undefined) return 0;
        const newRecords = records.filter(element => element !== record);
        if (newRecords.length === 0) {
            this.connectedRecords.delete(key);
            return 0;
        } else {
            this.connectedRecords.set(key, newRecords);
            return newRecords.length;
        }
    }
}