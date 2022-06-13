/**
 * DHCP service.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as gateway from "default-gateway";
import * as ip from "ip";
import { Service, ServiceBuilder } from "../Service";
import { DatabaseService } from "../database/DatabaseService";
import { SETTINGS_DATABASE } from "../../../common/models/Setting";
import { DHCPServer } from "./DHCPServer";
import { DatabaseManager } from "../../../common/database/DatabaseManager";

export interface DHCPSettings {
    gateway_ip: string,
    dhcp_ip: string,
    dns_ip: string,
    ip_lease_time_s: number,
    local_domain: string,
}

const DEFAULT_SETTINGS: DHCPSettings = {
    gateway_ip: gateway.v4.sync().gateway,
    dhcp_ip: ip.address(),
    dns_ip: gateway.v4.sync().gateway,
    ip_lease_time_s: 5 * 60 /* 5 minutes */,
    local_domain: "local",
}

const NAME = "DHCP";

export class DHCPService implements Service {
    static Builder: ServiceBuilder<DHCPService> = {
        name: NAME,
        dependencyBuilders: [DatabaseService.Builder],
        build: async (databaseService: DatabaseService) => {
            const databaseManager = databaseService.getDatabaseManager();

            const settings = await databaseManager.getRecord(SETTINGS_DATABASE, NAME, () => DEFAULT_SETTINGS);
            return new DHCPService(settings, databaseService.getDatabaseManager());
        },
    }

    private readonly server: DHCPServer;

    constructor(settings: DHCPSettings, databaseManager: DatabaseManager) {
        this.server = new DHCPServer(settings, databaseManager);
    }

    async start() {
        await this.server.start();
        console.log(">> DHCP server started");
    }
}
