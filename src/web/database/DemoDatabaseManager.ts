/**
 * Local database for demonstratio and testing.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseManager } from "./DatabaseManager";
import { LocalDatabase } from "../../database/LocalDatabase";
import { Device, DEVICE_KEY_BY_ID, DEVICE_LIST_KEY, DEVICE_GROUP_LIST_KEY } from "../models/Device";
import { Group } from "../models/Group";
import { App, APP_GROUP_LIST_KEY, APP_KEY_BY_ID, APP_LIST_KEY } from "../models/App";
import { DEVICE_CATEGORIES } from "../models/DeviceCategories";


const DEVICES: Device[] = [
    {
        id: "26:05:3B:9A:7C:2E",
        name: "Gateway",
        groupId: 1,
        category: DEVICE_CATEGORIES.ROUTER,
        online: true,
        ip: "192.168.200.1",
        mac: "26:05:3B:9A:7C:2E",
        vendor: "TP-LINK",
        model: "SRT-2375",
        hostname: "gateway.local",
        permissions: {},
    },
    {
        id: "1A:D4:8D:53:9F:89",
        name: "Kitchen",
        groupId: 1,
        category: DEVICE_CATEGORIES.ROUTER_WIFI,
        online: true,
        ip: "192.168.200.2",
        mac: "1A:D4:8D:53:9F:89",
        vendor: "Asus",
        model: "RT-AX55",
        hostname: "kitchen-ap.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "F6:E1:15:56:34:C6",
        name: "Downstairs",
        groupId: 1,
        category: DEVICE_CATEGORIES.ROUTER_WIFI,
        online: true,
        ip: "192.168.200.3",
        mac: "F6:E1:15:56:34:C6",
        vendor: "Asus",
        model: "RT-AX55",
        hostname: "downstairs-ap.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "77:43:4F:3C:49:13",
        name: "In-law",
        groupId: 1,
        category: DEVICE_CATEGORIES.ROUTER_WIFI,
        online: true,
        ip: "192.168.200.4",
        mac: "77:43:4F:3C:49:13",
        vendor: "Asus",
        model: "RT-AX55",
        hostname: "inlaw-ap.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "5B:10:7D:F4:A7:CB",
        name: "SafeGate",
        groupId: 1,
        category: DEVICE_CATEGORIES.ROUTER,
        online: true,
        ip: "192.168.200.5",
        mac: "5B:10:7D:F4:A7:CB",
        vendor: "Uncloud",
        model: "X89",
        hostname: "safegate.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "18:38:6A:7D:F3:85",
        name: "Pixel",
        groupId: 2,
        category: DEVICE_CATEGORIES.PHONE,
        ip: "192.168.200.6",
        mac: "18:38:6A:7D:F3:85",
        vendor: "Google",
        online: true,
        model: "Pixel 3",
        hostname: "pixel.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "7A:0E:9A:B7:EF:51",
        name: "HP",
        groupId: 2,
        category: DEVICE_CATEGORIES.LAPTOP,
        online: false,
        ip: "192.168.200.7",
        mac: "7A:0E:9A:B7:EF:51",
        vendor: "HP",
        model: "15-dy1051wm",
        hostname: "marco-laptop.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "72:AF:56:86:C6:F8",
        name: "Workstation",
        groupId: 2,
        category: DEVICE_CATEGORIES.WORKSTATION,
        online: true,
        ip: "192.168.200.8",
        mac: "72:AF:56:86:C6:F8",
        vendor: "Dell",
        model: "Tower 52",
        hostname: "marco-desktop.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "4D:3B:AA:AE:9E:C3",
        name: "iPhone",
        groupId: 3,
        category: DEVICE_CATEGORIES.PHONE,
        vendor: "Apple",
        online: true,
        ip: "192.168.200.9",
        mac: "4D:3B:AA:AE:9E:C3",
        model: "11",
        hostname: "catherine-iphone.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "07:9B:ED:1C:C0:DF",
        name: "MacBook",
        groupId: 3,
        category: DEVICE_CATEGORIES.LAPTOP,
        vendor: "Apple",
        online: false,
        ip: "192.168.200.10",
        mac: "07:9B:ED:1C:C0:DF",
        model: "MacBook Air",
        hostname: "catherine-macbook.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "C3:64:EB:3E:31:F1",
        name: "iPad",
        groupId: 3,
        category: DEVICE_CATEGORIES.TABLET,
        vendor: "Apple",
        online: true,
        ip: "192.168.200.11",
        mac: "C3:64:EB:3E:31:F1",
        model: "iPad Pro",
        hostname: "catherine-ipad.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "BC:40:91:6A:65:B8",
        name: "TV Room",
        groupId: 4,
        category: DEVICE_CATEGORIES.TV,
        online: true,
        ip: "192.168.200.12",
        mac: "BC:40:91:6A:65:B8",
        vendor: "Sony",
        model: "Bravia",
        hostname: "tv-mediaroom.local",
        permissions: {
            local_network: false,
            internet: true,
        }
    },
    {
        id: "07:50:E0:B1:AF:00",
        name: "In-law",
        groupId: 4,
        category: DEVICE_CATEGORIES.TV,
        online: true,
        ip: "192.168.200.13",
        mac: "07:50:E0:B1:AF:00",
        vendor: "Sony",
        model: "Bravia",
        hostname: "tv-inlaw.local",
        permissions: {
            local_network: false,
            internet: true,
        }
    },
    {
        id: "09:A8:49:65:16:13",
        name: "Kitchen",
        groupId: 4,
        category: DEVICE_CATEGORIES.SMART_SPEAKER,
        vendor: "Google",
        online: true,
        ip: "192.168.200.14",
        mac: "09:A8:49:65:16:13",
        model: "Home",
        hostname: "google-home.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "2B:E7:BA:76:9B:A8",
        name: "BaseStation",
        groupId: 5,
        category: DEVICE_CATEGORIES.HUB,
        vendor: "Ring",
        online: true,
        ip: "192.168.200.15",
        mac: "2B:E7:BA:76:9B:A8",
        model: "Base station v3",
        hostname: "ring-basestation.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "98:7D:68:48:67:80",
        name: "Gate",
        groupId: 5,
        category: DEVICE_CATEGORIES.CAMERA,
        vendor: "Ring",
        online: true,
        ip: "192.168.200.16",
        mac: "98:7D:68:48:67:80",
        model: "Outpro Pro 2",
        hostname: "ring-gate-camera.local",
        permissions: {
            local_network: true,
            internet: true,
        }
    },
    {
        id: "8B:64:A7:51:D8:64",
        name: "8B:64:A7:51:D8:64",
        groupId: 0,
        online: true,
        ip: "192.168.200.17",
        mac: "8B:64:A7:51:D8:64",
        vendor: "Roborock",
        permissions: {
            local_network: false,
            internet: true,
        }
    },
];

const DEVICE_GROUPS: Group[] = [
    {id: 1, name: "Network"},
    {id: 2, name: "Marco's devices"},
    {id: 3, name: "Catherine's devices"},
    {id: 4, name: "Smart Home"},
    {id: 5, name: "Security"},
    {id: 0, name: "Unassigned"},
];

const APPS: App[] = [
    {
        id: "app/create",
        name: "Create",
        icon: "create.png",
        groupId: 2,
    },
    {
        id: "app/install",
        name: "Install",
        icon: "install.png",
        groupId: 2,
    },
    {
        id: "adblocker",
        name: "Ad Blocker",
        icon: "adblocker.svg",
        groupId: 1,
    },
    {
        id: "dhcp_server",
        name: "DHCP Server",
        icon: "dhcp_server.png",
        groupId: 0,
    },
    {
        id: "home_automation",
        name: "Home Automation",
        icon: "home_automation.png",
        groupId: 1,
    },
    {
        id: "home_security",
        name: "Home Security",
        icon: "home_security.png",
        groupId: 1,
    },
    {
        id: "file_storage",
        name: "File Storage",
        icon: "file_storage.png",
        groupId: 1,
    },
    {
        id: "media_server",
        name: "Media Server",
        icon: "media_server.png",
        groupId: 1,
    },
    {
        id: "router",
        name: "Router",
        icon: "router.png",
        groupId: 0,
    },
    {
        id: "network_security",
        name: "Network Security",
        icon: "network_security.png",
        groupId: 1,
    },
    {
        id: "parental_control",
        name: "Parental Control",
        icon: "parental_control.svg",
        groupId: 1,
    },
    {
        id: "passwords",
        name: "Passwords",
        icon: "passwords.png",
        groupId: 1,
    },
    {
        id: "print_scan",
        name: "Print & Scan",
        icon: "print_scan.png",
        groupId: 1,
    },
    {
        id: "voice_assistant",
        name: "Voice Assistant",
        icon: "voice_assistant.jpg",
        groupId: 1,
    },
];

const APP_GROUPS: Group[] = [
    {id: 0, name: "Installed"},
    {id: 1, name: "In development"},
    {id: 2, name: "More"},
];


export class DemoDatabaseManager extends DatabaseManager {
    private readonly localDatabase = new LocalDatabase();

    constructor() {
        super("");

        this.init();
    }

    async getDatabase() {
        return this.localDatabase;
    }

    private async init() {
        const devices: string[] = [];
        await Promise.all(DEVICES.map(async device => {
            await this.localDatabase.set(DEVICE_KEY_BY_ID(device.mac), device);
            devices.push(device.mac);
        }));
        await this.localDatabase.set(DEVICE_LIST_KEY, devices);
        await this.localDatabase.set(DEVICE_GROUP_LIST_KEY, DEVICE_GROUPS);

        const apps: string[] = [];
        await Promise.all(APPS.map(async app => {
            await this.localDatabase.set(APP_KEY_BY_ID(app.id), app);
            apps.push(app.id);
        }));
        await this.localDatabase.set(APP_LIST_KEY, apps);
        await this.localDatabase.set(APP_GROUP_LIST_KEY, APP_GROUPS);
    }
}