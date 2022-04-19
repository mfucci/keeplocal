/** 
 * Connects to a remote database over a WebSocket.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Database } from "../../database/Database";
import { ClientMessenger } from "../../database/remote/ClientMessenger";
import { RemoteDatabase } from "../../database/remote/RemoteDatabase";
import { JSONStream } from "../../stream/JSONStream";
import { MessageStream } from "../../stream/MessageStream";
import { WebsocketStream } from "../../stream/BrowserWebsocketStream";

export class DatabaseManager {
    private database?: Database;

    constructor(private readonly url: string) {}

    async getDatabase() {
        if (this.database === undefined) {
            this.database = new RemoteDatabase(new ClientMessenger(new MessageStream(new JSONStream(await WebsocketStream.fromUrl(this.url)))));
        }
        return this.database;
    }
}
