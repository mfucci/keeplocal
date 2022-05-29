/**
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from "assert";
import { ClientMessenger } from "../../../src/database/remote/ClientMessenger";
import { RemoteDatabase } from "../../../src/database/remote/RemoteDatabase";
import { getPromiseResolver } from "../../../src/utils/Promises";
import EventEmitter from "events";

const RECORD_KEY = "/key";
const REMOTE_INITIAL_VALUE = "remote_init_value";
const REMOTE_NEW_VALUE = "remote_new_value";
const LOCAL_NEW_VALUE = "local_new_value";

class FakeClientMessenger extends EventEmitter {
  connectedRecords = new Array<string>();

  async requestConnect<T>(key: string) {
    this.connectedRecords.push(key);
    return REMOTE_INITIAL_VALUE as unknown as T;
  }

  updateRemote<T>(key: string, value: T) {
    this.emit("remote_update", key, value);
  }

  async requestUpdate<T>(key: string, value?: T) {
    return value;
  }

  async requestDisconnect(key: string) {
    this.connectedRecords = this.connectedRecords.filter((el) => el !== key);
  }
}

describe("RemoteDatabase", () => {
  var fakeMessenger: FakeClientMessenger;
  var database: RemoteDatabase;

  beforeEach(() => {
    fakeMessenger = new FakeClientMessenger();
    database = new RemoteDatabase(fakeMessenger as unknown as ClientMessenger);
  });

  context("getRecord", () => {
    it("connects the record", async () => {
      const result = await database.getRecord<string>(RECORD_KEY);

      assert.equal(fakeMessenger.connectedRecords.includes(RECORD_KEY), true);
      assert.equal(result.get(), REMOTE_INITIAL_VALUE);
    });

    it("returns different records if called twice but only connects once", async () => {
      const result1 = await database.getRecord<string>(RECORD_KEY);
      const result2 = await database.getRecord<string>(RECORD_KEY);

      assert.notEqual(result1 === result2, true);
      assert.equal(fakeMessenger.connectedRecords.length, 1);
    });
  });

  context("Record.get", () => {
    it("returns the initial value after connection", async () => {
      const record = await database.getRecord<string>(RECORD_KEY);

      const result = record.get();

      assert.equal(result, REMOTE_INITIAL_VALUE);
    });

    it("returns the new value after the record has been remotely updated", async () => {
      const record = await database.getRecord<string>(RECORD_KEY);
      fakeMessenger.updateRemote(RECORD_KEY, REMOTE_NEW_VALUE);

      const result = record.get();

      assert.equal(result, REMOTE_NEW_VALUE);
    });
  });

  context("Record <event>", () => {
    it("sends an update event when the record is remote updated", async () => {
      const record = await database.getRecord<string>(RECORD_KEY);
      const { promise, resolver } = await getPromiseResolver<
        string | undefined
      >();
      record.on("update", (value) => resolver(value));

      fakeMessenger.updateRemote(RECORD_KEY, REMOTE_NEW_VALUE);

      assert.equal(await promise, REMOTE_NEW_VALUE);
    });
  });

  context("Record.set", () => {
    it("sets a new value", async () => {
      const record = await database.getRecord<string>(RECORD_KEY);

      const result = await record.set(LOCAL_NEW_VALUE);

      assert.equal(result, LOCAL_NEW_VALUE);
      assert.equal(record.get(), LOCAL_NEW_VALUE);
    });

    it("emits an update event", async () => {
      const { promise, resolver } = await getPromiseResolver<
        string | undefined
      >();
      const record = await database.getRecord<string>(RECORD_KEY);
      record.on("update", (value) => resolver(value));

      await record.set(LOCAL_NEW_VALUE);

      assert.equal(await promise, LOCAL_NEW_VALUE);
    });
  });

  context("Record.close", () => {
    it("disconnects the remote record if it is the only connection", async () => {
      const record = await database.getRecord<string>(RECORD_KEY);

      await record.close();

      assert.equal(fakeMessenger.connectedRecords.includes(RECORD_KEY), false);
    });

    it("don't disconnect the remote record if there are still local connections to it", async () => {
      const record1 = await database.getRecord<string>(RECORD_KEY);
      const record2 = await database.getRecord<string>(RECORD_KEY);

      await record1.close();

      assert.equal(fakeMessenger.connectedRecords.includes(RECORD_KEY), true);
    });
  });
});
