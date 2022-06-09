/**
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from "assert";
import { Stream } from "../../src/backend/stream/Stream";
import { JSONStream } from "../../src/backend/stream/JSONStream";
import { MessageStream, MessageWrappers } from "../../src/backend/stream/MessageStream";
import { getPromiseResolver } from "../../src/backend/utils/Promises";
import { Queue } from "../../src/backend/stream/Queue";

class FakeStream<T> extends Stream<T, T> {
    private inputQueue = new Queue<T>();
    private outputQueue = new Queue<T>();

    async writeInput(message: T) {
        this.inputQueue.write(message);
    }

    async read(): Promise<T> {
        return await this.inputQueue.read();
    }

    async write(message: T) {
        this.outputQueue.write(message);
    }

    async readOutput(): Promise<T> {
        return await this.outputQueue.read();
    }

    async close() {
        this.emit("closed");
    }
}

const MESSAGE = {
    a: 21,
    b: {
        c: "ss",
    },
}

describe("JSONStream", () => {
    let fakeStream: FakeStream<string>;
    let jsonStream: JSONStream<typeof MESSAGE, typeof MESSAGE>;

    beforeEach(() => {
        fakeStream = new FakeStream<string>();
        jsonStream = new JSONStream(fakeStream);
    });

    context("read", () => {
        it("reads a posted object", async () => {
            await fakeStream.writeInput(JSON.stringify(MESSAGE) + "\n");

            const result = await jsonStream.read();

            assert.deepEqual(result, MESSAGE);
        });

        it("blocks until data are posted", async () => {
            const promise = jsonStream.read();

            await fakeStream.writeInput(JSON.stringify(MESSAGE) + "\n");

            const result = await promise;

            assert.deepEqual(result, MESSAGE);
        });


        it("splits multiple posted objects", async () => {
            await fakeStream.writeInput(JSON.stringify(MESSAGE) + "\n" + JSON.stringify(MESSAGE) + "\n");

            const result = [
                await jsonStream.read(),
                await jsonStream.read(),
            ];

            assert.deepEqual(result, [MESSAGE, MESSAGE]);
        });
    });


    context("write", () => {
        it("writes JSON objects followed by a separator", async () => {
            await jsonStream.write(MESSAGE);
            await jsonStream.write(MESSAGE);

            const result = [
                await fakeStream.readOutput(),
                await fakeStream.readOutput(),
            ];

            assert.deepEqual(result, [JSON.stringify(MESSAGE) + "\n", JSON.stringify(MESSAGE) + "\n"]);
        });
    });

    context("<closed>", () => {
        it("forwards close events", async () => {
            const { promise, resolver } = await getPromiseResolver<boolean>();
            jsonStream.on("closed", () => resolver(true));

            fakeStream.close();

            assert.equal(await promise, true);
        });
    });
});

const MESSAGE_1 = {
    a: "ssjgj",
}

const MESSAGE_2 = {
    sdf: "sdf",
}

const MESSAGE_3 = {
    fd: 31,
}

interface TEST_MESSAGE_MAP {
    "m1": typeof MESSAGE_1,
    "m2": typeof MESSAGE_2,
    "m3": typeof MESSAGE_3,
}

describe("MessageStream", () => {
    let fakeStream: FakeStream<MessageWrappers<TEST_MESSAGE_MAP>>;
    let messageStream: MessageStream<TEST_MESSAGE_MAP, TEST_MESSAGE_MAP>;

    beforeEach(() => {
        fakeStream = new FakeStream();
        messageStream = new MessageStream(fakeStream);
        messageStream.on("error", error => console.error(error));
    });

    context("write", () => {
        it("writes messages", async () => {
            await messageStream.write("m1", MESSAGE_1);

            assert.deepEqual(await fakeStream.readOutput(), {type: "m1", message: MESSAGE_1});
        });
    });

    context("read", () => {
        it("reads the expected message", async () => {
            const promise = messageStream.read("m1");

            await fakeStream.writeInput({type: "m1", message: MESSAGE_1});

            assert.deepEqual(await promise, MESSAGE_1);
        });
    });

    context("on", () => {
        it("sends an event to registered message listeners", async () => {
            const { promise, resolver } = await getPromiseResolver<TEST_MESSAGE_MAP[keyof TEST_MESSAGE_MAP]>();
            messageStream.on("m2", message => resolver(message));
            messageStream.on("m3", () => assert.fail("Unexpected M3 event"));

            await fakeStream.writeInput({ type: "m2", message: MESSAGE_2});

            assert.deepEqual(await promise, MESSAGE_2);
        });
    });

    context("<close>", () => {
        it("forwards close events", async () => {
            const { promise, resolver } = await getPromiseResolver<boolean>();
            messageStream.on("closed", () => resolver(true));

            fakeStream.close();

            assert.equal(await promise, true);
        });
    });
});
