/**
 * Looger service.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, ServiceBuilder } from "../Service";

import { DatabaseService } from "../database/DatabaseService";
import { LoggerService } from "../logger/LoggerService";
import { APPS_DATABASE, AppType } from "../../../common/models/App";
import { INSTALLED_GROUP_ID } from "../frontend/FrontendService";
import { DnsServer } from "./DNSServer";
import * as gateway from "default-gateway";

const NAME = "DNS";

export interface DnsSettings {
    // TODO: add settings if any needed
}

const DEFAULT_SETTINGS: DnsSettings = {
}

export class DnsService implements Service {
    static Builder: ServiceBuilder<DnsService> = {
        name: NAME,
        dependencyBuilders: [
            DatabaseService.Builder,
            LoggerService.Builder
        ],
        build: async (databaseService: DatabaseService, loggerService: LoggerService) => new DnsService(databaseService, loggerService),
    }

    private readonly databaseManager;
    private readonly server: DnsServer;

    constructor(
        databaseService: DatabaseService,
        private readonly loggerService: LoggerService
    ) {
        this.databaseManager = databaseService.getDatabaseManager();
        this.server = new DnsServer(gateway.v4.sync().gateway, this.loggerService, this.databaseManager);
    }

    async start() {
        await this.databaseManager.getRecord(APPS_DATABASE, "dns", () => ({ _id: "dns", name: "DNS", icon: "dns.png", type: AppType.External, url: "/dns", groupId: INSTALLED_GROUP_ID, order: 0 }));
        console.log(">> DNS service started");
        this.server.start();
    }
}
