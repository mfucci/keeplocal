/**
 * Remote database server implementation using JSON / websocket.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from "stream";
import { WebSocketServer, WebSocket }  from "ws";
import { ServerMessenger, ServerMessengerProvider } from "./ServerMessenger";
import { JSONStream } from "../../stream/JSONStream";
import { MessageStream } from "../../stream/MessageStream";
import { WebsocketStream } from "../../stream/NodeWebsocketStream";
import { Database } from "../Database";
import { DatabaseServer } from "./DatabaseServer";

class WebsocketServerMessengerProvider extends EventEmitter implements ServerMessengerProvider {
    constructor(server: WebSocketServer) {
        super();
        server.on("connection", socket => this.handleConnection(socket));
    }

    private handleConnection(socket: WebSocket) {
        this.emit("connection", new ServerMessenger(new MessageStream(new JSONStream(new WebsocketStream(socket)))));
    }
}

export class WebsocketDatabaseServer {
    private readonly databaseServer: DatabaseServer;

    constructor(database: Database, port: number = 8080) {
        this.databaseServer = new DatabaseServer(database, new WebsocketServerMessengerProvider(new WebSocketServer({ port })));
        this.databaseServer.on("connection", count => this.handleConnection(count));
        this.databaseServer.on("disconnection", count => this.handleDisconnection(count));
    }

    private handleConnection(count: number) {
    }

    private handleDisconnection(count: number) {
    }
}
