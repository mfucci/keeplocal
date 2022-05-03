import { Service, ServiceBuilder } from "../Service";
import { DatabaseService } from "../database/DatabaseService";
import { ScanRequest as ScanRequest, NETWORK_SCAN_DATABASE as NETWORK_SCAN_DATABASE } from "../../../common/models/NetworkScan";
import { Database, Entry } from "../../../common/database/Database";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import * as ipUtil from "ip";
import * as gateway from "default-gateway";
import { SUBNET_MASK } from "../dhcp/DHCPServer";
import { Device, DEVICES_DATABASE, IpType } from "../../../common/models/Device";
import { createDevice } from "../../common/DeviceCreator";
import { APPS_DATABASE, AppType } from "../../../common/models/App";
import { INSTALLED_GROUP_ID } from "../frontend/FrontendService";
import { getPromiseResolver } from "../../utils/Promises";
import ping from "ping";
import arp from "node-arp";
import * as macAddressHelper from "macaddress";


const NAME = "NetworkScanner";

export class NetworkScannerService implements Service {
    static Builder: ServiceBuilder<NetworkScannerService> = {
        name: NAME,
        dependencyBuilders: [DatabaseService.Builder],
        build: async (databaseService: DatabaseService) => new NetworkScannerService(databaseService),
    }

    private databaseManager: DatabaseManager;
    private scanRequestQueue: Database<ScanRequest>;

    constructor(
        databaseService: DatabaseService,
    ) {
        this.databaseManager = databaseService.getDatabaseManager();
        this.scanRequestQueue = this.databaseManager.getDatabase<ScanRequest>(NETWORK_SCAN_DATABASE);
    }

    async start() {
        await this.databaseManager.getRecord(APPS_DATABASE, "network_scanner", () => ({_id: "network_scanner", name: "Network Scanner", icon: "network_scanner.png", type: AppType.BuiltIn, url: "/network_scanner", groupId: INSTALLED_GROUP_ID, order: 0}));
        await this.scanRequestQueue.clear();

        this.scanRequestQueue.onChange((_, request) => this.handleScanRequest(request));

        console.log(`>> ARP scanner service started`);
    }

    private async handleScanRequest(request?: Entry<ScanRequest>) {
        if (request === undefined || request.response !== undefined) return;

        await this.databaseManager.withDatabase<Device>(DEVICES_DATABASE, async deviceDatabase => {
            const knownDevices = await deviceDatabase.getRecords();
            const devicesByIp = new Map<string, Entry<Device>>();
            const devicesByMac = new Map<String, Entry<Device>>();
            knownDevices.forEach(device => {
                if (device.ip !== undefined) devicesByIp.set(device.ip, device);
                devicesByMac.set(device.mac, device);
            });
    
            await this.scan(request, async (ip, mac) => {
                const deviceByIp = devicesByIp.get(ip);
                const deviceByMac = devicesByMac.get(mac);

                if (deviceByMac !== undefined && deviceByIp === deviceByMac) {
                    // All match, continue
                    return;
                }

                if (deviceByIp?.ip !== undefined) {
                    // This IP was assigned to another device, unassigning
                    devicesByIp.delete(deviceByIp.ip);
                    deviceByIp.ip = undefined;
                    await deviceDatabase.updateRecord(deviceByIp);
                }

                if (deviceByMac !== undefined) {
                    // This device was already known
                    if (deviceByIp === deviceByMac) {
                        // All match, continue
                        return;
                    }
                    if (deviceByMac?.ip !== undefined) {
                        // This device was known on a different IP, updating.
                        devicesByIp.delete(deviceByMac.ip);
                    }
                    // Assigning IP to this device
                    deviceByMac.ip = ip;
                    devicesByIp.set(ip, deviceByMac);
                    await deviceDatabase.updateRecord(deviceByMac);
                    return;
                }

                // Create a new device
                const newDevice = await deviceDatabase.addRecord({...createDevice(mac, IpType.STATIC), ip});
                devicesByIp.set(ip, newDevice);
                devicesByMac.set(mac, newDevice);
            });
        });
    }

    private async scan(request: Entry<ScanRequest>, deviceFoundCallback: (ip: string, mac: string) => Promise<void>) {
        const gatewayIp = gateway.v4.sync().gateway;

        const prefix = ipUtil.mask(gatewayIp, SUBNET_MASK).slice(0, -1);
        const ipsToScan: string[] = [];
        for (var ipAddress = 1; ipAddress < 255; ipAddress++) {
            ipsToScan.push(prefix + ipAddress);
        }

        const response = {
            devicesFound: 0,
            ipsToScan: ipsToScan.length,
            ipsScanned: 0,
        };
        request = await this.scanRequestQueue.updateRecord({...request, response});

        const interval = setInterval(async () => {
            request = await this.scanRequestQueue.updateRecord({...request, response});
        }, 1000);

        // Add this device since it won't respond to ping from itself
        const myIp = ipUtil.address();
        const myMac = (await macAddressHelper.one()).toUpperCase();
        await deviceFoundCallback(myIp, myMac);

        await Promise.all([...Array(20)].map(async () => {
            while (true) {
                const ip = ipsToScan.shift();
                if (ip === undefined) return;
                await this.scanIp(ip, deviceFoundCallback);
                response.ipsScanned++;
            }
        }));

        clearInterval(interval);
        this.scanRequestQueue.removeRecord(request);
    }

    private async scanIp(ip: string, deviceFoundCallback: (ip: string, mac: string) => Promise<void>) {
        const { alive } = await ping.promise.probe(ip, {timeout: 1, deadline: 1, min_reply: 1});
        if (!alive) return;
        const mac = await this.getMac(ip);
        if (mac === undefined) return;

        await deviceFoundCallback(ip, mac);
    }

    private async getMac(ip: string) {
        const { promise, resolver } = await getPromiseResolver<string | undefined>();
        arp.getMAC(ip, (err, mac) => {
            if (err) {
                console.log(JSON.stringify(err));
                resolver(undefined);
            }
            resolver(mac);
        });
        return (await promise)?.toUpperCase();
    }
}
