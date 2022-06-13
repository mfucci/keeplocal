/**
 * Base class for all streams.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from "events";

export enum ERROR {
    EOF = "End of stream",
}

interface StreamEventMap {
    "closed": [],
    "error": [error: Error],
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export declare interface Stream<READ_T, WRITE_T = READ_T> {
    on<K extends keyof StreamEventMap>(event: K, listener: (...value: StreamEventMap[K]) => void): this;
    once<K extends keyof StreamEventMap>(event: K, listener: (...value: StreamEventMap[K]) => void): this;
    emit<K extends keyof StreamEventMap>(event: K, ...value: StreamEventMap[K]): boolean;
}

export abstract class Stream<READ_T, WRITE_T = READ_T> extends EventEmitter {
    abstract write(message: WRITE_T): Promise<void>;
    abstract read(): Promise<READ_T>;
    abstract close(): Promise<void>;
}

interface StreamProviderEventMap<READ_T, WRITE_T = READ_T> {
    "connected": [stream: Stream<READ_T, WRITE_T>],
}

export interface StreamProvider<READ_T, WRITE_T = READ_T> {
    on<K extends keyof StreamProviderEventMap<READ_T, WRITE_T>>(event: K, listener: (...value: StreamProviderEventMap<READ_T, WRITE_T>[K][]) => void): this;
    once<K extends keyof StreamProviderEventMap<READ_T, WRITE_T>>(event: K, listener: (...value: StreamProviderEventMap<READ_T, WRITE_T>[K][]) => void): this;
    emit<K extends keyof StreamProviderEventMap<READ_T, WRITE_T>>(event: K, ...value: StreamProviderEventMap<READ_T, WRITE_T>[K]): boolean;
}
