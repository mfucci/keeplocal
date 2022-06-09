import { Service, ServiceBuilder } from "../Service";
import { FrontService } from "../frontend/FrontendService";
import { DHCPService } from "../dhcp/DHCPService";

export class DaemonService implements Service {
    static Builder: ServiceBuilder<DaemonService> = {
        name: "Daemon",
        dependencyBuilders: [FrontService.Builder, DHCPService.Builder],
        build: async () => new DaemonService(),
    }

    async start() {
        console.log("Daemon is running");
    }
}
