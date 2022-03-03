/**
 * Remote database client implementation using JSON for the message serialization.
 * 
 * It is transport layer agnostic.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { RemoteDatabase } from "./RemoteDatabase";
import { JSONStream } from "../../stream/JSONStream";
import { MessageStream } from "../../stream/MessageStream";
import { Stream } from "../../stream/Stream";
import { ClientMessenger } from "./ClientMessenger";

export class JSONRemoteDatabase extends RemoteDatabase {
    constructor(stream: Stream<string, string>) {
        super(new ClientMessenger(new MessageStream(new JSONStream(stream))));
    }
}
