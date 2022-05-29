/**
 * Database API wrapper to provide high level fonctionalities wihtout relying on the database system.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseManager } from "./DatabaseManager";

export type Entry<T> = PouchDB.Core.ExistingDocument<T>;
export type NewEntry<T> = T & Partial<PouchDB.Core.IdMeta>;

export class Database<T> {
  readonly name: string;
  private readonly listeners: PouchDB.Core.Changes<T>[] = [];

  constructor(
    private readonly underlyingDatabase: PouchDB.Database<T>,
    private readonly manager: DatabaseManager
  ) {
    this.name = underlyingDatabase.name;
  }

  onRecordChange(id: string, callback: (value?: Entry<T>) => void) {
    this.listeners.push(
      this.underlyingDatabase
        .changes({
          include_docs: true,
          live: true,
          doc_ids: [id],
          since: "now",
        })
        .on("change", (change) =>
          callback(change.deleted ? undefined : change.doc)
        )
    );
    this.underlyingDatabase.get(id).then((value) => callback(value));
  }

  onChange(callback: (id: string, value?: Entry<T>) => void) {
    this.listeners.push(
      this.underlyingDatabase
        .changes({ include_docs: true, live: true, since: "now" })
        .on("change", (change) =>
          callback(change.id, change.deleted ? undefined : change.doc)
        )
    );
  }

  async getRecord(id: string, defaultProvider?: () => T) {
    try {
      return await this.underlyingDatabase.get(id);
    } catch (error: any) {
      if (defaultProvider === undefined || error.reason !== "missing")
        throw error;
      const value = { _id: id, ...defaultProvider() };
      const response = await this.underlyingDatabase.put(value);
      return { ...value, _rev: response.rev };
    }
  }

  async getRecords() {
    return (
      await this.underlyingDatabase.allDocs({ include_docs: true })
    ).rows.map((row) => row.doc) as PouchDB.Core.ExistingDocument<T>[];
  }

  async addRecord(value: NewEntry<T>): Promise<Entry<T>> {
    const response =
      value._id === undefined
        ? await this.underlyingDatabase.post(value)
        : await this.underlyingDatabase.put(value);
    return { ...value, _id: response.id, _rev: response.rev };
  }

  async addRecords(values: NewEntry<T>[]) {
    await this.underlyingDatabase.bulkDocs(values);
  }

  async updateRecord(value: Entry<T>): Promise<Entry<T>> {
    const response = await this.underlyingDatabase.put(value);
    return { ...value, _rev: response.rev };
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

  async clear() {
    const records = await this.underlyingDatabase.allDocs({
      include_docs: true,
    });
    await this.underlyingDatabase.bulkDocs(
      records.rows.map((row) => ({ ...(row.doc as T), _deleted: true }))
    );
  }

  async delete() {
    await this.underlyingDatabase.destroy();
    this.close();
  }

  close() {
    this.listeners.forEach((listener) => listener.cancel());
    this.manager.close(this);
  }
}
