/**
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from "assert";
import {
  ServerMessenger,
  ServerMessengerProvider,
} from "../../../src/database/remote/ServerMessenger";
import { DatabaseServer } from "../../../src/database/remote/DatabaseServer";
import { Record } from "../../../src/database/Record";
import { Database } from "../../../src/database/Database";
import { EventEmitter } from "events";
import { Queue } from "../../../src/stream/Queue";
import { Stream } from "../../../src/stream/Stream";
import { MessageStream } from "../../../src/stream/MessageStream";
import { RESPONSE_CODE } from "../../../src/database/remote/Messages";

class FakeServerMessengerProvider
  extends EventEmitter
  implements ServerMessengerProvider
{
  constructor(readonly messenger: ServerMessenger) {
    super();
  }

  receiveConnection() {
    this.emit("connection", this.messenger);
  }
}

class FakeObjectStream extends Stream<any, any> {
  sentQueue = new Queue<any>();
  receiveQueue = new Queue<any>();

  postMessage(message: any) {
    this.receiveQueue.write(message);
  }

  async write(message: any) {
    this.sentQueue.write(message);
  }

  async read() {
    return await this.receiveQueue.read();
  }

  async getSentMessage() {
    return await this.sentQueue.read();
  }

  async close() {
    this.emit("closed");
  }
}

class FakeDatabase extends Database {
  data = new Map<string, string>();
  getRecordCount = 0;

  async getRecord<T>(key: string) {
    this.data.set(key, DEFAULT_VALUE);
    this.getRecordCount++;
    return this.createRecord<T>(key);
  }

  protected getInternal<T>(record: Record<T>): T {
    return this.data.get(record.key) as unknown as T;
  }

  protected async setInternal<T>(record: Record<T>, value?: T) {
    this.data.set(record.key, value as unknown as string);
    this.emitUpdate(record.key, value);
    return value;
  }

  protected closeRecord<T>(record: Record<T>): Promise<number> {
    this.data.delete(record.key);
    return super.closeRecord(record);
  }
}

const KEY = "/key";
const KEY2 = "/key2";
const DEFAULT_VALUE = "default";
const NEW_VALUE = "new";

describe("DatabaseServer", () => {
  var fakeObjectStream: FakeObjectStream;
  var fakeMessengerProvider: FakeServerMessengerProvider;
  var fakeDatabase: FakeDatabase;
  var server: DatabaseServer;

  beforeEach(async () => {
    fakeObjectStream = new FakeObjectStream();
    fakeMessengerProvider = new FakeServerMessengerProvider(
      new ServerMessenger(new MessageStream(fakeObjectStream))
    );
    fakeDatabase = new FakeDatabase();
    server = new DatabaseServer(fakeDatabase, fakeMessengerProvider);
  });

  context("connect request", () => {
    it("creates a local connection for a connect request", async () => {
      fakeMessengerProvider.receiveConnection();

      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });

      assert.deepEqual(await fakeObjectStream.getSentMessage(), {
        type: "connect",
        message: { code: RESPONSE_CODE.OK, value: DEFAULT_VALUE },
      });
      assert.equal(fakeDatabase.data.get(KEY), DEFAULT_VALUE);
    });

    it("ignores consecutive connect request for the same key", async () => {
      fakeMessengerProvider.receiveConnection();

      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });
      await fakeObjectStream.getSentMessage();
      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });
      await fakeObjectStream.getSentMessage();

      assert.equal(fakeDatabase.getRecordCount, 1);
    });
  });

  context("update request", () => {
    it("updates local database and returns updated value", async () => {
      fakeMessengerProvider.receiveConnection();
      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });
      const resp = await fakeObjectStream.getSentMessage();

      fakeObjectStream.postMessage({
        type: "update",
        message: { key: KEY, value: NEW_VALUE },
      });

      assert.deepEqual(await await fakeObjectStream.getSentMessage(), {
        type: "update",
        message: { code: RESPONSE_CODE.OK, value: NEW_VALUE },
      });
      assert.equal(fakeDatabase.data.get(KEY), NEW_VALUE);
    });
  });

  context("local update", () => {
    it("notifies the client of the update", async () => {
      fakeMessengerProvider.receiveConnection();
      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });
      await fakeObjectStream.getSentMessage();
      const localRecord = await fakeDatabase.getRecord(KEY);

      await localRecord.set(NEW_VALUE);

      assert.deepEqual(await fakeObjectStream.getSentMessage(), {
        type: "remote_update",
        message: { key: KEY, value: NEW_VALUE },
      });
    });
  });

  context("disconnect request", () => {
    it("closes a record disconnection request", async () => {
      fakeMessengerProvider.receiveConnection();
      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });
      await fakeObjectStream.getSentMessage();

      fakeObjectStream.postMessage({
        type: "disconnect",
        message: { key: KEY },
      });

      assert.deepEqual(await fakeObjectStream.getSentMessage(), {
        type: "disconnect",
        message: { code: RESPONSE_CODE.OK },
      });
      assert.equal(fakeDatabase.data.has(KEY), false);
    });
  });

  context("disconnection", () => {
    it("closes all local connections on disconnection", async () => {
      fakeMessengerProvider.receiveConnection();
      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY } });
      await fakeObjectStream.getSentMessage();
      fakeObjectStream.postMessage({ type: "connect", message: { key: KEY2 } });
      await fakeObjectStream.getSentMessage();

      fakeObjectStream.close();

      assert.equal(fakeDatabase.data.has(KEY), false);
      assert.equal(fakeDatabase.data.has(KEY2), false);
    });
  });
});
