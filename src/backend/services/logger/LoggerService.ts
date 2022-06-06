/**
 * Looger service.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, ServiceBuilder } from "../Service";

import { DatabaseService } from "../database/DatabaseService";
import { Database } from "../../../common/database/Database";
import { Device } from "../../../common/models/Device";
import { NetworkEventLog, NETWORK_EVENT_DATABASE } from "../../../common/models/NetworkEvent";

const NAME = "Logger";

export interface LoggerSettings {
    // TODO: add retention info
}

const DEFAULT_SETTINGS: LoggerSettings = {
}

export class NetworkEventLogger<T> {
    constructor(
        private readonly database: Database<NetworkEventLog<T>>,
        private readonly service: string) {

    }

    log(timestamp: number, {_id: device_id }: Device, event: T) {
        this.database.addRecord({ timestamp, device_id, service: this.service, event });
    }
}

export class LoggerService implements Service {
    static Builder: ServiceBuilder<LoggerService> = {
        name: NAME,
        dependencyBuilders: [DatabaseService.Builder],
        build: async (databaseService: DatabaseService) => new LoggerService(databaseService),
    }

    private readonly databaseManager;

    constructor(databaseService: DatabaseService) {
        this.databaseManager = databaseService.getDatabaseManager();
    }

    async start() {
        console.log(">> Logging service started");
    }

    getNetworkEventLogger<T>(service: string): NetworkEventLogger<T> {
        return new NetworkEventLogger<T>(this.databaseManager.getDatabase<NetworkEventLog<T>>(NETWORK_EVENT_DATABASE), service);
    }
}
