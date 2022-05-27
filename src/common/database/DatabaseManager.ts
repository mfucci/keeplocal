/** 
 * Connects to a remote or local database.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import PouchDb from "pouchdb";
import { Database, Entry } from "./Database";

const DATABASE_REUSE_DELAY_MS = 5000;

export class DatabaseManager {
    private readonly databaseCache = new Map<string, PouchDB.Database<any>>();
    private readonly databaseConnections = new Map<string, Database<any>[]>();

    constructor(private readonly url: string) {}

    protected createdNewDatabase<T>(name: string) {
        return new PouchDb<T>(`${this.url}/${name}`);
    }

    async getRecord<T>(name: string, id: string, defaultProvider?: () => T) {
        return await this.withDatabase<T, T>(name, database => database.getRecord(id, defaultProvider));
    }

    async getRecords<T>(name: string) {
        return await this.withDatabase<T, T[]>(name, database => database.getRecords())
    }

    async addRecord<T>(name: string, value: NewEntry<T>): Promise<Entry<T>> {
        return await this.withDatabase<T, Entry<T>>(name, database => database.addRecord(value));
    }

    async withDatabase<T, R = void>(name: string, operation: (database: Database<T>) => Promise<R>): Promise<R> {
        const database = this.getDatabase<T>(name);
        try {
            return await operation(database);
        } finally {
            database.close();
        }
    }

    getDatabase<T>(name: string): Database<T> {
        var underlyingDatabase = this.databaseCache.get(name);
        if (underlyingDatabase === undefined) {
            underlyingDatabase = this.createdNewDatabase(name);
        }
        const database = new Database<T>(underlyingDatabase, this);
        var connections = this.databaseConnections.get(name);
        if (connections === undefined) {
            connections = [];
            this.databaseConnections.set(name, connections);
        }
        connections.push(database);
        return database;
    }

    close(database: Database<any>) {
        const connections = this.databaseConnections.get(database.name);
        if (connections === undefined) return;
        const index = connections.findIndex(connection => connection.name === database.name);
        if (index === -1) return;
        if (connections.length === 1) {
            this.databaseConnections.delete(database.name);
            setTimeout(() => this.closeDatabase(database.name), DATABASE_REUSE_DELAY_MS);
        } else {
            connections.splice(index, 1);
        }
    }

    private closeDatabase(name: string) {
        // Don't close the database, it has been reused
        if (this.databaseConnections.has(name)) return;

        const database = this.databaseCache.get(name);
        if (database === undefined) return;
        this.databaseCache.delete(name);
        database.close();
    }
}
