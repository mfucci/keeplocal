import { Service, ServiceBuilder } from "../Service";
import { FrontService } from "../frontend/FrontendService";
import { DHCPService } from "../dhcp/DHCPService";
import { NetworkScannerService } from "../scanner/NetworkScannerService";

export class DaemonService implements Service {
    static Builder: ServiceBuilder<DaemonService> = {
        name: "Daemon",
        dependencyBuilders: [FrontService.Builder, DHCPService.Builder, NetworkScannerService.Builder],
        build: async () => new DaemonService(),
    }

    constructor() {}

    async start() {}
}
