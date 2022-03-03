/**
 * Database live record, allow to get / set / litsen for updates.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from "events";

interface RecordEventMap<T> {
    "update": T | undefined;
}

export declare interface Record<T> {
    on<K extends keyof RecordEventMap<T>>(event: K, listener: (value: RecordEventMap<T>[K]) => void): this;
    once<K extends keyof RecordEventMap<T>>(event: K, listener: (value: RecordEventMap<T>[K]) => void): this;
    emit<K extends keyof RecordEventMap<T>>(event: K, value: RecordEventMap<T>[K]): boolean;
}

export abstract class Record<T> extends EventEmitter {
    constructor(readonly key: string) {
        super();
    }

    abstract get(): T | undefined;
    abstract set(value?: T): Promise<T | undefined>;
    abstract close(): Promise<void>;
}