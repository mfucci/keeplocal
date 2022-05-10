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
import { Device, DEVICES_DATABASE } from "../../../common/models/Device";

const NAME = "DNS";

export interface DnsSettings {
    // TODO: add settings if any needed
}

const DEFAULT_SETTINGS: DnsSettings = {
}

export class DnsService implements Service {
    static Builder: ServiceBuilder<DnsService> = {
        name: NAME,
        dependencyBuilders: [DatabaseService.Builder, LoggerService.Builder],
        build: async (databaseService: DatabaseService, loggerService: LoggerService) => new DnsService(databaseService, loggerService),
    }

    private readonly databaseManager;

    constructor(databaseService: DatabaseService,
            private readonly loggerService: LoggerService) {
        this.databaseManager = databaseService.getDatabaseManager();
    }

    async start() {
        await this.databaseManager.getRecord(APPS_DATABASE, "dns", () => ({_id: "dns", name: "DNS", icon: "dns.png", type: AppType.External, url: "/dns", groupId: INSTALLED_GROUP_ID, order: 0}));

        const mac = "2354254";
        const database = this.databaseManager.getDatabase<Device>(DEVICES_DATABASE);
        var device = await database.getRecord(mac);

        device.ip = undefined;

        database.updateRecord(device._id, {ip: undefined, name: "deleted"});




        console.log(">> DNS service started");
    }
}
