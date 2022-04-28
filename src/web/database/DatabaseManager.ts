/** 
 * Connects to a remote database.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import PouchDb from "pouchdb";

export type Entry<T> = PouchDB.Core.ExistingDocument<T>;

export class Database<T> {
    readonly name: string;
    private readonly listeners: PouchDB.Core.Changes<T>[] = [];

    constructor(
        private readonly underlyingDatabase: PouchDB.Database<T>,
        private readonly manager: DatabaseManager) {
        this.name = underlyingDatabase.name;
    }

    onRecordChange(id: string, callback: (value?: Entry<T>) => void) {
        this.listeners.push(this.underlyingDatabase
            .changes({ include_docs: true, live: true, doc_ids: [id], since: "now"})
            .on("change", change => callback(change.doc)));
        this.underlyingDatabase.get(id).then(value => callback(value));
    }

    onChange(callback: (id: string, value?: Entry<T>) => void) {
        this.listeners.push(this.underlyingDatabase
            .changes({ include_docs: true, live: true, since: "now"})
            .on("change", change => callback(change.id, change.doc)));
    }

    async getRecord(id: string) {
        return await this.underlyingDatabase.get(id);
    }

    async getRecords() {
        return (await this.underlyingDatabase.allDocs({include_docs: true})).rows.map(row => row.doc) as PouchDB.Core.ExistingDocument<T>[];
    }

    async addRecord(value: T) {
        await this.underlyingDatabase.put(value);
    }

    async addRecords(values: T[]) {
        await this.underlyingDatabase.bulkDocs(values);
    }

    async updateRecord(value: Entry<T>) {
        await this.underlyingDatabase.put(value);
    }

    async updateRecords(values: Entry<T>[]) {
        await this.underlyingDatabase.bulkDocs(values);
    }

    async removeRecord(value: Entry<T>) {
        await this.underlyingDatabase.remove(value);
    }

    async remove(id: string) {
        await this.removeRecord(await this.getRecord(id));
    }

    async delete() {
        await this.underlyingDatabase.destroy();
        this.close();
    }

    close() {
        this.listeners.forEach(listener => listener.cancel());
        this.manager.close(this);
    }
}

const DATABASE_REUSE_DELAY_MS = 5000;

export class DatabaseManager {
    private readonly databaseCache = new Map<string, PouchDB.Database<any>>();
    private readonly databaseConnections = new Map<string, Database<any>[]>();

    constructor(private readonly url: string) {}

    protected createdNewDatabase<T>(name: string) {
        return new PouchDb<T>(`${this.url}/${name}`);
    }

    async withDatabase<T>(name: string, operation: (database: Database<T>) => Promise<void>) {
        const database = this.getDatabase<T>(name);
        try {
            await operation(database);
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
