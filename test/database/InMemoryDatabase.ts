/**
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from "assert";
import { LocalDatabase } from "../../src/database/LocalDatabase";
import { getPromiseResolver } from "../../src/utils/Promises";

const RECORD_KEY = "/key";

describe("LocalDatabase", () => {
    var database: LocalDatabase;

    beforeEach(() => {
        database = new LocalDatabase();
    });

    context("getRecord", () => {
        it("returns a record", async () => {
            const result = await database.getRecord<string>(RECORD_KEY);

            assert.notEqual(result, undefined);
        });

        it("returns different records if called twice", async () => {
            const result1 = await database.getRecord<string>(RECORD_KEY);
            const result2 = await database.getRecord<string>(RECORD_KEY);

            assert.notEqual(result1 === result2, true);
        });
    });

    context("Record.get", () => {
        it("returns undefined if there is no value", async () => {
            const record = await database.getRecord<string>(RECORD_KEY);

            const result = record.get();

            assert.equal(result, undefined);
        });

        it("returns the value when there is one", async () => {
            const record = await database.getRecord<string>(RECORD_KEY);
            record.set("something");

            const result = record.get();

            assert.equal(result, "something");
        });
    });

    context("Record.set", () => {
        it("sets a new value", async () => {
            const record = await database.getRecord<string>(RECORD_KEY);

            record.set("something");

            assert.equal(record.get(), "something");
        });

        it("emits an update event", async () => {
            const { promise, resolver } = await getPromiseResolver<string | undefined>();
            const record = await database.getRecord<string>(RECORD_KEY);
            record.on("update", value => resolver(value));

            record.set("something");

            assert.equal(await promise, "something");
        });
    });

    context("Record.close", () => {
        it("no more events are sent after the record is closed", async () => {
            const record = await database.getRecord<string>(RECORD_KEY);
            record.on("update", () => assert.fail("Unexpected event received"));

            await record.close();

            const newRecord = await database.getRecord<string>(RECORD_KEY);
            await newRecord.set("something");
        });
    });
});
