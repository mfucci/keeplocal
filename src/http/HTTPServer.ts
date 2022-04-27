/** 
 * Serves the UI built in the public directory.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import PouchDB from "pouchdb";
import expressPouchDB from "express-pouchdb";
import { getPersistentStorageDir } from "../utils/Paths";
import fs from "fs";

export class HTTPServer {
    private readonly server = express();

    constructor(readonly port: number) {}

    async start() {
        // Static file serving
        this.server.use(express.static(path.join(__dirname, "public")));

        // Database serving
        const databasePath = await getPersistentStorageDir("database");
        const logFile = await getPersistentStorageDir("logs") + "database_http.log";
        const configFile = databasePath + "config.json";
        const databaseUrlPrefix = "/db";
        this.server.use(databaseUrlPrefix, (req, res, next) => {
            // Hot fix of pouchdb-fauxton@0.0.6 to fix issue https://github.com/pouchdb/pouchdb-fauxton/issues/19
            // If pouchdb-fauxton is updated to merge with upstream fixes in Fauxton, this patch won't be required anymore.
            if (req.url.endsWith("_utils/dashboard.assets/js/bundle-34997e32896293a1fa5d71f79eb1b4f7.js")) {
                const jsFile = fs.readFileSync(path.join(__dirname, "../../node_modules/pouchdb-fauxton/www/dashboard.assets/js/bundle-34997e32896293a1fa5d71f79eb1b4f7.js")).toString();
                res.send(jsFile
                    .replace("host:\"../..\"", "host:\"..\"")
                    .replace("root:\"/_utils\"", `root:"${databaseUrlPrefix}/_utils"`)
                    .replace(/url:\"\/_session/g, `url:"${databaseUrlPrefix}/_session`)
                    .replace(/url:\"\/_replicator/g, `url:"${databaseUrlPrefix}/_replicator`)
                    .replace(/window\.location\.origin\+\"\/_replicator/g, `window.location.origin+"${databaseUrlPrefix}/_replicator`)
                    .replace(/url:\"\/_users/g, `url:"${databaseUrlPrefix}/_users`)
                    .replace("window.location.origin+\"/\"+o.default.utils.safeURLName", `window.location.origin+"${databaseUrlPrefix}/"+o.default.utils.safeURLName`));
                return;
            }

            return expressPouchDB(
                PouchDB.defaults({ prefix: databasePath }),
                { 
                    logPath: logFile,
                    configPath: configFile,
                })(req, res, next);
        });

        this.server.listen(this.port, () => console.log(`HTTP server listening on port ${this.port}`));
    }
}
