/**
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as assert from "assert";
import EventEmitter from "events";
import { LocalDatabase } from "../../../src/database/LocalDatabase";
import { DatabaseServer } from "../../../src/database/remote/DatabaseServer";
import { Record } from "../../../src/database/Record";
import { ServerMessenger, ServerMessengerProvider } from "../../../src/database/remote/ServerMessenger";
import { RemoteDatabase } from "../../../src/database/remote/RemoteDatabase";
import { JSONStream } from "../../../src/stream/JSONStream";
import { MessageStream } from "../../../src/stream/MessageStream";
import { getPipedStreams } from "../../../src/stream/PipedStream";
import { getPromiseResolver } from "../../../src/utils/Promises";
import { ClientMessenger } from "../../../src/database/remote/ClientMessenger";

class TestServerMessengerProvider extends EventEmitter implements ServerMessengerProvider {
    connect(serverMessenger: ServerMessenger) {
        this.emit("connection", serverMessenger);
    }
}

const RECORD_KEY = "/test";
const INITIAL_VALUE = "initial";
const LOCAL_UPDATE_VALUE = "local";
const REMOTE_UPDATE_VALUE = "remote";

describe("EndToEnd", () => {
    const [clientToServerStream, serverToClientStream] = getPipedStreams<string, string>();
    const clientMessenger = new ClientMessenger(new MessageStream(new JSONStream(clientToServerStream)));
    const serverMessenger = new ServerMessenger(new MessageStream(new JSONStream(serverToClientStream)));
    const serverMessengerProvider = new TestServerMessengerProvider();
    const serverDatabase = new LocalDatabase();
    const databaseServer = new DatabaseServer(serverDatabase, serverMessengerProvider);
    const clientDatabase = new RemoteDatabase(clientMessenger);

    var serverRecord: Record<string>;
    var clientRecord: Record<string>;

    context("full end-to-end", () => {
        it("connects to the server", async () => {
            const { promise, resolver } = await getPromiseResolver<number>();
            databaseServer.once("connection", count => resolver(count));
            serverMessengerProvider.connect(serverMessenger);

            assert.equal(await promise, 1);
        });

        it("connects to a remote record and gets its value", async () => {
            serverRecord = await serverDatabase.getRecord(RECORD_KEY);
            await serverRecord.set(INITIAL_VALUE);
            clientRecord = await clientDatabase.getRecord<string>(RECORD_KEY);

            assert.equal(clientRecord.get(), INITIAL_VALUE);
        });

        it("updates the remote record value", async () => {
            const REPONSE_VALUE = await clientRecord.set(LOCAL_UPDATE_VALUE);

            assert.equal(REPONSE_VALUE, LOCAL_UPDATE_VALUE);
            assert.equal(clientRecord.get(), LOCAL_UPDATE_VALUE);
            assert.equal(serverRecord.get(), LOCAL_UPDATE_VALUE);
        });

        it("notifies for the remote record updates", async () => {
            const { promise, resolver } = await getPromiseResolver<string | undefined>();
            clientRecord.on("update", value => resolver(value));

            await serverRecord.set(REMOTE_UPDATE_VALUE);

            assert.equal(await promise, REMOTE_UPDATE_VALUE);
            assert.equal(clientRecord.get(), REMOTE_UPDATE_VALUE);
        });

        it("disconnects for the record", async () => {
            await clientRecord.close();
        });

        it("disconnects the connection", async () => {
            const { promise, resolver } = await getPromiseResolver<number>();
            databaseServer.once("disconnection", count => resolver(count));
            clientDatabase.close();

            assert.equal(await promise, 0);
        });
    });
});
