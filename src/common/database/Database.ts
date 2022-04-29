import { DatabaseManager } from "./DatabaseManager";

export type Entry<T> = PouchDB.Core.ExistingDocument<T>;
export type NewEntry<T> = T & Partial<PouchDB.Core.IdMeta>;

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
            .changes({ include_docs: true, live: true, doc_ids: [id], since: "now" })
            .on("change", change => callback(change.doc)));
        this.underlyingDatabase.get(id).then(value => callback(value));
    }

    onChange(callback: (id: string, value?: Entry<T>) => void) {
        this.listeners.push(this.underlyingDatabase
            .changes({ include_docs: true, live: true, since: "now" })
            .on("change", change => callback(change.id, change.doc)));
    }

    async getRecord(id: string, defaultProvider?: () => T) {
        try {
            return await this.underlyingDatabase.get(id);
        } catch (error: any) {
            if (defaultProvider === undefined || error.reason !== "missing") throw error;
            const value = { _id: id, ...defaultProvider() };
            const response = await this.underlyingDatabase.put(value);
            return { ...value, _rev: response.rev};
        }
    }

    async getRecords() {
        return (await this.underlyingDatabase.allDocs({ include_docs: true })).rows.map(row => row.doc) as PouchDB.Core.ExistingDocument<T>[];
    }

    async addRecord(value: NewEntry<T>) {
        await this.underlyingDatabase.put(value);
    }

    async addRecords(values: NewEntry<T>[]) {
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
