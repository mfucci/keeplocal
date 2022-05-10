/**
 * Network scanning service that can be used to discover all devices on the subnet.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, ServiceBuilder } from "../Service";
import { DatabaseService } from "../database/DatabaseService";
import { ScanRequest as ScanRequest, NETWORK_SCAN_DATABASE as NETWORK_SCAN_DATABASE } from "../../../common/models/NetworkScan";
import { Database, Entry } from "../../../common/database/Database";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { SUBNET_MASK } from "../dhcp/DHCPServer";
import { Device, DeviceService, DEVICES_DATABASE, DEVICES_GROUPS_DATABASE, IpType } from "../../../common/models/Device";
import { createNew, generateName, isOnline } from "../../common/DeviceUtils";
import { APPS_DATABASE, AppType } from "../../../common/models/App";
import { INSTALLED_GROUP_ID } from "../frontend/FrontendService";
import { getMacForIp, isRandom } from "../../utils/MacUtils";
import { getGatewayIp, getHostname, getSubnetPrefix, getThisDeviceIp } from "../../utils/IpUtils";
import { PingScanner } from "./PingScanner";
import { TcpScanner } from "./TcpScanner";
import { Group, UNASSIGNED_GROUP_ID } from "../../../common/models/Group";
import { SsdpScanner } from "./SsdpScanner";
import { MdnsScanner } from "./MdnsScanner";


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

        this.scanRequestQueue.onChange((_, request) => {
            if (request === undefined || request.response !== undefined) return;
            this.handleScanRequest(request);
        });

        console.log(`>> ARP scanner service started`);
    }

    private async handleScanRequest({_id: requestId}: Entry<ScanRequest>) {
        const gatewayIp = getGatewayIp();
        const prefix = getSubnetPrefix(gatewayIp, SUBNET_MASK);
        const ipsToScan: string[] = [];
        for (var ipAddress = 1; ipAddress < 255; ipAddress++) {
            ipsToScan.push(prefix + ipAddress);
        }

        const response = {
            devicesFound: 0,
            ipsToScan: ipsToScan.length,
            ipsScanned: 0,
        };
        await this.scanRequestQueue.updateRecord(requestId, {response});

        const interval = setInterval(async () => {
            response.ipsScanned = response.ipsToScan - ipsToScan.length;
            await this.scanRequestQueue.updateRecord(requestId, {response});
        }, 1000);

        // Add known devices
        const knownIps = [
            {ip: getThisDeviceIp(), name: "keeplocal-server"},
            {ip: gatewayIp, name: "router"},
        ];
        for (var {ip, name} of knownIps) {
            await this.handleNewIp(ip, name);
            ipsToScan.splice(ipsToScan.findIndex(ipToScan => ipToScan === ip), 1);
        }

        // Scan the rest of the network with ping
        // await new PingScanner(20).scan(ipsToScan, ip => this.handleNewIp(ip));

        const devices = await this.databaseManager.getRecords<Device>(DEVICES_DATABASE);
        const deviceIps = devices.filter(device => device.ip !== null && isOnline(device)).map(device => device.ip as string);

        /*
        // Detecting devices with an HTTP server
        await this.databaseManager.getRecord<Group>(DEVICES_GROUPS_DATABASE, "web_interface", () => ({ _id: "web_interface", name: "Has a web interface", order: 0 }));
        await new TcpScanner(20, 80).scan(deviceIps, async ip => {
            console.log(ip);
            const device = devices.find(device => device.ip === ip) as Entry<Device>;
            await this.databaseManager.updateRecord<Device>(DEVICES_DATABASE, device._id, device => {
                if (device.services.indexOf(DeviceService.HTTP) !== -1) {
                    device.services.push(DeviceService.HTTP);
                }
                if (device.groupId === UNASSIGNED_GROUP_ID) {
                    device.groupId = "web_interface";
                }
            });
        });

        // Detecting devices with an ssh server
        await this.databaseManager.getRecord<Group>(DEVICES_GROUPS_DATABASE, "ssh_interface", () => ({ _id: "ssh_interface", name: "Has a ssh interface", order: 0 }));
        await new TcpScanner(20, 22).scan(deviceIps, async ip => {
            const device = devices.find(device => device.ip === ip) as Entry<Device>;
            await this.databaseManager.updateRecord<Device>(DEVICES_DATABASE, device._id, device => {
                if (device.services.indexOf(DeviceService.SSH) !== -1) {
                    device.services.push(DeviceService.SSH);
                }
                if (device.groupId === UNASSIGNED_GROUP_ID) {
                    device.groupId = "ssh_interface";
                }
            });
        });

        // Detecting devices with random MACs
        await this.databaseManager.getRecord<Group>(DEVICES_GROUPS_DATABASE, "portable", () => ({ _id: "portable", name: "Portable device: laptop / phone / tablet", order: 0 }));
        await Promise.all(devices.map(async device => {
            if (!isRandom(device.mac) || device.groupId !== UNASSIGNED_GROUP_ID) return;
            await this.databaseManager.updateRecord(DEVICES_DATABASE, device._id, {groupId: "portable"});
        })); */

        //new SsdpScanner().scan();
        new MdnsScanner().scan();

        clearInterval(interval);
        this.scanRequestQueue.remove(requestId);
    }

    private async handleNewIp(ip: string, newName?: string) {
        const mac = await getMacForIp(ip);
        if (mac === undefined) return;

        await this.databaseManager.withDatabase<Device>(DEVICES_DATABASE, async database => {
            const hostname = await getHostname(ip);
            const device = await database.getRecord(mac, () => createNew(mac, IpType.STATIC, {name: newName ?? generateName(mac, hostname)}));
            await database.updateRecord(device._id, {ip, lastSeen: Date.now(), hostname});
        });
    }
}
