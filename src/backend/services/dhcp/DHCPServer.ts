/** 
 * A simple DHCP server.
 * 
 * It assigns IP inside a default subnet to local devices.
 * It can use to perform more advanced operations by moving local devices to other subnets.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import arp from "@network-utils/arp-lookup";
import * as ipUtil from "ip";
import * as macAddressHelper from "macaddress";

import { DHCPServerMessenger, Request } from "./DHCPMessenger";
import { Device, DEVICES_DATABASE, IpType } from "../../../common/models/Device";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { DHCPService, DHCPSettings } from "./DHCPService";
import { Database } from "../../../common/database/Database";
import { SETTINGS_DATABASE } from "../../../common/models/Setting";
import { createDevice } from "../../common/DeviceCreator";

export const SUBNET_MASK = "255.255.255.0";

// TODO: support decline messages
export class DHCPServer {
    private readonly messenger = new DHCPServerMessenger();
    private readonly settingDatabase: Database<DHCPSettings>;
    private readonly deviceDatabase: Database<Device>;
    private readonly ipMap = new Map<string, string>();

    constructor(
            private settings: DHCPSettings,
            private readonly databaseManager: DatabaseManager) {
        this.messenger.on("discover", request => this.handleDiscover(request));
        this.messenger.on("request", request => this.handleRequest(request));
        this.settingDatabase = databaseManager.getDatabase<DHCPSettings>(SETTINGS_DATABASE);
        this.deviceDatabase = databaseManager.getDatabase<Device>(DEVICES_DATABASE);

        // TODO: listen for settings changes
        this.settingDatabase.onRecordChange(DHCPService.Builder.name, settings => this.updateSettings(settings));
    }

    async start() {
        await this.init();
        this.messenger.listen();
    }

    private updateSettings(settings?: DHCPSettings) {
        if (settings === undefined) return;
        this.settings = settings;
    }

    private async init() {
        const devices = await this.deviceDatabase.getRecords();

        // Recover all previously assigned IPs and static IPs
        for (const device of devices) {
            const { ip, ipType, mac } = device;
            if (ip === undefined) return;
            if (this.ipMap.has(ip)) {
                // Another device already has this IP
                if (ipType === IpType.STATIC) {
                    throw new Error(`IP ${ip} is assigned to 2 devices using static IPs`);
                } else {
                    await this.deviceDatabase.updateRecord({...device, ip: undefined});
                }
            } else {
                this.ipMap.set(ip, mac);
            }
        }

        // Add self if needed
        const myIp = ipUtil.address();
        if (!this.ipMap.has(myIp)) {
            const myMac = (await macAddressHelper.one()).toUpperCase();
            this.ipMap.set(myIp, myMac);
            await this.deviceDatabase.addRecord({...createDevice(myMac, IpType.STATIC), name: "keeplocal", ip: myIp, lastSeen: Date.now()});
        }

        // Create Device records for network equipments if they don't exist yet.
        const { dns_ip, dhcp_ip, gateway_ip } = this.settings;
        this.checkStaticDeviceRecord(gateway_ip, "router");
        this.checkStaticDeviceRecord(dhcp_ip, "dhcp");
        this.checkStaticDeviceRecord(dns_ip, "dns");
    }

    private async checkStaticDeviceRecord(ip: string, name: string) {
        const ipRecord = this.ipMap.get(ip);
        if (ipRecord !== undefined) return;

        const mac = (await arp.toMAC(ip))?.toUpperCase();
        if (mac === undefined) throw new Error(`Cannot find network equipment with IP ${ip}`);
        this.ipMap.set(ip, mac);
        await this.deviceDatabase.addRecord({...createDevice(mac, IpType.STATIC), name, ip, lastSeen: Date.now()});
    }

    stop() {
        this.settingDatabase.close();
        this.deviceDatabase.close();
        this.messenger.close();
    }

    private async handleDiscover(request: Request) {
        const device = await this.getDevice(request);
        this.messenger.sendOffer(request, this.settings, device.ip as string, this.getRouter(device.permissions?.internet));
    }

    private async handleRequest(request: Request) {
        const device = await this.getDevice(request);
        const addressRequested = request.requestedIp ?? request.ip;
        if (addressRequested !== device.ip || device.ip === undefined) {
            this.messenger.sendNak(request, this.settings);
        } else {
            this.messenger.sendAck(request, this.settings, device.ip, this.getRouter(device.permissions?.internet));
        }
    }

    private getRouter(internetPermission = true) {
        return internetPermission ? this.settings.gateway_ip : this.settings.dhcp_ip;
    }

    private async getDevice(request: Request) {
        const { mac, hostname, classId } = request;
        const device = await this.deviceDatabase.getRecord(mac, () => createDevice(mac, IpType.DYNAMIC, {internet: true}));
        if (device.ip === undefined) device.ip = await this.assignNewIp(mac);
        await this.deviceDatabase.updateRecord({...device, lastSeen: Date.now(), hostname, classId });
        return device;
    }

    private async assignNewIp(mac: string) {
        const { gateway_ip, ip_lease_time_s } = this.settings;
        
        const prefix = ipUtil.mask(gateway_ip, SUBNET_MASK).slice(0, -1);
        let ipAddress = 1;
        for (;;) {
            const proposedIp = prefix + ipAddress;
            if (!this.ipMap.has(proposedIp)) {
                this.ipMap.set(proposedIp, mac);
                return proposedIp;
            }
            ipAddress++;
            if (ipAddress == 255) {
                // No more available IP on the subnet
                break;
            }
        }

        const now = Date.now();
        const devices = (await this.deviceDatabase.getRecords())
            .filter(({ ip, ipType, lastSeen}) =>
                ip !== undefined
                && ipType === IpType.DYNAMIC
                && (lastSeen === undefined || (now - lastSeen) > ip_lease_time_s))
            .sort((a, b) => (a.lastSeen ?? 0) - (b.lastSeen ?? 0));
        if (devices.length === 0) throw new Error(`No more available IP addresses in the subnet ${prefix}`);
        const freedIp = devices[0].ip as string;
        await this.deviceDatabase.updateRecord({...devices[0], ip: undefined});
        this.ipMap.set(freedIp, mac);
        return freedIp;
    }
}
