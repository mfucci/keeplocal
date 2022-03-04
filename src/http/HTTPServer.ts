/** 
 * Serves the UI built in the public directory.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";

export class HTTPServer {
    private readonly server = express();

    constructor(readonly port: number) {
        this.server.use(express.static(path.join(__dirname, "public")));
    }

    start() {
        this.server.listen(this.port, () => console.log(`HTTP server listening on port ${this.port}`));
    }
}
