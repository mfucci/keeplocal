/**
 * Stream using JSON message serialization.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stream } from "./Stream";

const SEPARATOR = "\n";

export class JSONStream<READ_T, WRITE_T> extends Stream<READ_T, WRITE_T> {
    private buffer = "";

    constructor(readonly stream: Stream<string>) {
        super();
        stream.on("closed", () => this.emit("closed"));
        stream.on("error", error => this.emit("error", error));
    }

    async write(message: WRITE_T) {
        await this.stream.write(JSON.stringify(message) + SEPARATOR);
    }

    async read() {
        let separatorPosition;
        while ((separatorPosition = this.buffer.indexOf(SEPARATOR)) === -1) {
            this.buffer += await this.stream.read();
        }
        const jsonString = this.buffer.slice(0, separatorPosition);
        this.buffer = this.buffer.slice(separatorPosition + SEPARATOR.length);
        return JSON.parse(jsonString) as READ_T;
    }

    async close() {
        await this.stream.close();
    }
}
