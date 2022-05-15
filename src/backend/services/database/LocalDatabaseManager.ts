/**
 * Database manager for a local database to use before the database is served over HTTP.
 * 
 * It cannot be used as the same time as the HTTP database manager, since change events / database creations are not synchronized between systems by PouchDB.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import PouchDB from "pouchdb";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { getPersistentStorageDir } from "../../utils/Paths";
 
export const LocalPouchDb = PouchDB.defaults({ prefix: getPersistentStorageDir("database") });

export class LocalDatabaseManager extends DatabaseManager {
    constructor() {
        super("");
    }

    protected createdNewDatabase<T>(name: string): PouchDB.Database<T> {
        return new LocalPouchDb(name);
    }
}
