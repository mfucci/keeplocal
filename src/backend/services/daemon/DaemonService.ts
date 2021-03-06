/**
 * Daemon service that will start all dependencies.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, ServiceBuilder } from "../Service";
import { FrontService } from "../frontend/FrontendService";
import { DHCPService } from "../dhcp/DHCPService";
import { NetworkScannerService } from "../scanner/NetworkScannerService";
import { DnsService } from "../dns/DnsService";

export class DaemonService implements Service {
    static Builder: ServiceBuilder<DaemonService> = {
        name: "Daemon",
        dependencyBuilders: [
            FrontService.Builder,
            DHCPService.Builder,
            NetworkScannerService.Builder,
            DnsService.Builder,
        ],
        build: async () => new DaemonService(),
    }

    async start() {
        console.log("Daemon is running");
    }
}
