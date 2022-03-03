/**
 * Local database storing data either in memory or in a custom storage.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Record } from "./Record";
import { Database } from "./Database";

export interface Storage {
    get(key: string): any;
    set(key: string, value: any): void;
}

export class InMemoryStorage implements Storage {
    private storage = new Map<string, any>();

    get(key: string) {
        return this.storage.get(key);
    }

    set(key: string, value: any) {
        this.storage.set(key, value);
    }
}

export class LocalDatabase extends Database {

    constructor(private readonly storage: Storage = new InMemoryStorage()) {
        super();
    }

    async getRecord<T>(key: string): Promise<Record<T>> {
        return this.createRecord<T>(key);
    }

    protected getInternal<T>(record: Record<T>): T {
        const { key } = record;
        return this.storage.get(key);
    }

    protected async setInternal<T>(record: Record<T>, value?: T) {
        const { key } = record;
        this.storage.set(key, value);
        const updatedValue = this.storage.get(key);
        this.emitUpdate(key, updatedValue);
        return updatedValue;
    }
}
