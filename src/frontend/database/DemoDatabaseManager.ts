/**
 * Local database for demonstration and testing.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import PouchDb from "pouchdb";

import { DatabaseManager } from "../../common/database/DatabaseManager";
import {
  Device,
  DEVICES_DATABASE,
  DEVICES_GROUPS_DATABASE,
  DEVICE_CATEGORIES,
  IpType,
} from "../../common/models/Device";
import { Group, UNASSIGNED_GROUP_ID } from "../../common/models/Group";
import {
  App,
  APPS_DATABASE,
  APPS_GROUPS_DATABASE,
  AppType,
} from "../../common/models/App";

const NOW = Date.now();

const DEVICES: Device[] = [
  {
    _id: "26:05:3B:9A:7C:2E",
    name: "Gateway",
    groupId: "1",
    order: 0,
    category: DEVICE_CATEGORIES.ROUTER,
    lastSeen: NOW,
    ipType: IpType.STATIC,
    ip: "192.168.200.1",
    mac: "26:05:3B:9A:7C:2E",
    vendor: "TP-LINK",
    model: "SRT-2375",
    hostname: "gateway.local",
    permissions: {},
  },
  {
    _id: "1A:D4:8D:53:9F:89",
    name: "Kitchen",
    groupId: "1",
    order: 1,
    category: DEVICE_CATEGORIES.ROUTER_WIFI,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.2",
    mac: "1A:D4:8D:53:9F:89",
    vendor: "Asus",
    model: "RT-AX55",
    hostname: "kitchen-ap.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "F6:E1:15:56:34:C6",
    name: "Downstairs",
    groupId: "1",
    order: 2,
    category: DEVICE_CATEGORIES.ROUTER_WIFI,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.3",
    mac: "F6:E1:15:56:34:C6",
    vendor: "Asus",
    model: "RT-AX55",
    hostname: "downstairs-ap.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "77:43:4F:3C:49:13",
    name: "In-law",
    groupId: "1",
    order: 3,
    category: DEVICE_CATEGORIES.ROUTER_WIFI,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.4",
    mac: "77:43:4F:3C:49:13",
    vendor: "Asus",
    model: "RT-AX55",
    hostname: "inlaw-ap.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "5B:10:7D:F4:A7:CB",
    name: "SafeGate",
    groupId: "1",
    order: 4,
    category: DEVICE_CATEGORIES.ROUTER,
    lastSeen: NOW,
    ipType: IpType.STATIC,
    ip: "192.168.200.5",
    mac: "5B:10:7D:F4:A7:CB",
    vendor: "Uncloud",
    model: "X89",
    hostname: "safegate.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "18:38:6A:7D:F3:85",
    name: "Pixel",
    groupId: "2",
    order: 0,
    category: DEVICE_CATEGORIES.PHONE,
    ip: "192.168.200.6",
    mac: "18:38:6A:7D:F3:85",
    vendor: "Google",
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    model: "Pixel 3",
    hostname: "pixel.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "7A:0E:9A:B7:EF:51",
    name: "HP",
    groupId: "2",
    order: 1,
    category: DEVICE_CATEGORIES.LAPTOP,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.7",
    mac: "7A:0E:9A:B7:EF:51",
    vendor: "HP",
    model: "15-dy1051wm",
    hostname: "marco-laptop.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "72:AF:56:86:C6:F8",
    name: "Workstation",
    groupId: "2",
    order: 2,
    category: DEVICE_CATEGORIES.WORKSTATION,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.8",
    mac: "72:AF:56:86:C6:F8",
    vendor: "Dell",
    model: "Tower 52",
    hostname: "marco-desktop.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "4D:3B:AA:AE:9E:C3",
    name: "iPhone",
    groupId: "3",
    order: 0,
    category: DEVICE_CATEGORIES.PHONE,
    vendor: "Apple",
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.9",
    mac: "4D:3B:AA:AE:9E:C3",
    model: "11",
    hostname: "catherine-iphone.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "07:9B:ED:1C:C0:DF",
    name: "MacBook",
    groupId: "3",
    order: 1,
    category: DEVICE_CATEGORIES.LAPTOP,
    vendor: "Apple",
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.10",
    mac: "07:9B:ED:1C:C0:DF",
    model: "MacBook Air",
    hostname: "catherine-macbook.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "C3:64:EB:3E:31:F1",
    name: "iPad",
    groupId: "3",
    order: 2,
    category: DEVICE_CATEGORIES.TABLET,
    vendor: "Apple",
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.11",
    mac: "C3:64:EB:3E:31:F1",
    model: "iPad Pro",
    hostname: "catherine-ipad.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "BC:40:91:6A:65:B8",
    name: "TV Room",
    groupId: "4",
    order: 0,
    category: DEVICE_CATEGORIES.TV,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.12",
    mac: "BC:40:91:6A:65:B8",
    vendor: "Sony",
    model: "Bravia",
    hostname: "tv-mediaroom.local",
    permissions: {
      local_network: false,
      internet: true,
    },
  },
  {
    _id: "07:50:E0:B1:AF:00",
    name: "In-law",
    groupId: "4",
    order: 1,
    category: DEVICE_CATEGORIES.TV,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.13",
    mac: "07:50:E0:B1:AF:00",
    vendor: "Sony",
    model: "Bravia",
    hostname: "tv-inlaw.local",
    permissions: {
      local_network: false,
      internet: true,
    },
  },
  {
    _id: "09:A8:49:65:16:13",
    name: "Kitchen",
    groupId: "4",
    order: 2,
    category: DEVICE_CATEGORIES.SMART_SPEAKER,
    vendor: "Google",
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.14",
    mac: "09:A8:49:65:16:13",
    model: "Home",
    hostname: "google-home.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "2B:E7:BA:76:9B:A8",
    name: "BaseStation",
    groupId: "5",
    order: 0,
    category: DEVICE_CATEGORIES.HUB,
    vendor: "Ring",
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.15",
    mac: "2B:E7:BA:76:9B:A8",
    model: "Base station v3",
    hostname: "ring-basestation.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "98:7D:68:48:67:80",
    name: "Gate",
    groupId: "5",
    order: 1,
    category: DEVICE_CATEGORIES.CAMERA,
    vendor: "Ring",
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.16",
    mac: "98:7D:68:48:67:80",
    model: "Outpro Pro 2",
    hostname: "ring-gate-camera.local",
    permissions: {
      local_network: true,
      internet: true,
    },
  },
  {
    _id: "8B:64:A7:51:D8:64",
    name: "8B:64:A7:51:D8:64",
    category: DEVICE_CATEGORIES.UNKNOWN,
    groupId: UNASSIGNED_GROUP_ID,
    order: 0,
    lastSeen: NOW,
    ipType: IpType.DYNAMIC,
    ip: "192.168.200.17",
    mac: "8B:64:A7:51:D8:64",
    vendor: "Roborock",
    permissions: {
      local_network: false,
      internet: true,
    },
  },
];

const DEVICES_GROUPS: Group[] = [
  { _id: "1", name: "Network", order: 0 },
  { _id: "2", name: "Marco's devices", order: 1 },
  { _id: "3", name: "Catherine's devices", order: 2 },
  { _id: "4", name: "Smart Home", order: 3 },
  { _id: "5", name: "Security", order: 4 },
  { _id: UNASSIGNED_GROUP_ID, name: "Unassigned", order: 5 },
];

const APPS: App[] = [
  {
    _id: "app/create",
    name: "Create",
    icon: "create.png",
    url: "/app/create",
    groupId: "2",
    order: 0,
    type: AppType.BuiltIn,
  },
  {
    _id: "app/install",
    name: "Install",
    icon: "install.png",
    url: "/app/install",
    groupId: "2",
    order: 1,
    type: AppType.BuiltIn,
  },
  {
    _id: "adblocker",
    name: "Ad Blocker",
    icon: "adblocker.svg",
    url: "/adblocker",
    groupId: "1",
    order: 0,
    type: AppType.BuiltIn,
  },
  {
    _id: "dhcp_server",
    name: "DHCP Server",
    icon: "dhcp_server.png",
    url: "/dhcp_server",
    groupId: "0",
    order: 0,
    type: AppType.BuiltIn,
  },
  {
    _id: "home_automation",
    name: "Home Automation",
    icon: "home_automation.png",
    url: "/home_automation",
    groupId: "1",
    order: 1,
    type: AppType.BuiltIn,
  },
  {
    _id: "home_security",
    name: "Home Security",
    icon: "home_security.png",
    url: "/home_security",
    groupId: "1",
    order: 2,
    type: AppType.BuiltIn,
  },
  {
    _id: "file_storage",
    name: "File Storage",
    icon: "file_storage.png",
    url: "/file_storage",
    groupId: "1",
    order: 3,
    type: AppType.BuiltIn,
  },
  {
    _id: "media_server",
    name: "Media Server",
    icon: "media_server.png",
    url: "/media_server",
    groupId: "1",
    order: 4,
    type: AppType.BuiltIn,
  },
  {
    _id: "router",
    name: "Router",
    icon: "router.png",
    url: "/router",
    groupId: "0",
    order: 1,
    type: AppType.BuiltIn,
  },
  {
    _id: "network_security",
    name: "Network Security",
    icon: "network_security.png",
    url: "/network_security",
    groupId: "1",
    order: 5,
    type: AppType.BuiltIn,
  },
  {
    _id: "parental_control",
    name: "Parental Control",
    icon: "parental_control.svg",
    url: "/parental_control",
    groupId: "1",
    order: 6,
    type: AppType.BuiltIn,
  },
  {
    _id: "passwords",
    name: "Passwords",
    icon: "passwords.png",
    url: "/passwords",
    groupId: "1",
    order: 7,
    type: AppType.BuiltIn,
  },
  {
    _id: "print_scan",
    name: "Print & Scan",
    icon: "print_scan.png",
    url: "/print_scan",
    groupId: "1",
    order: 8,
    type: AppType.BuiltIn,
  },
  {
    _id: "voice_assistant",
    name: "Voice Assistant",
    icon: "voice_assistant.jpg",
    url: "/voice_assistant",
    groupId: "1",
    order: 9,
    type: AppType.BuiltIn,
  },
];

const APPS_GROUPS: Group[] = [
  { _id: "0", name: "Installed", order: 0 },
  { _id: "1", name: "In development", order: 1 },
  { _id: "2", name: "More", order: 2 },
];

export class DemoDatabaseManager extends DatabaseManager {
  constructor() {
    super("");
  }

  protected createdNewDatabase<T>(name: string): PouchDB.Database<T> {
    return new PouchDb<T>(name);
  }

  private async clearAndFillDb<T>(name: string, items: T[]) {
    var db = this.getDatabase<T>(name);
    await db.delete();
    var db = this.getDatabase<T>(name);
    await db.addRecords(items);
    db.close();
  }

  async init() {
    await this.clearAndFillDb(DEVICES_DATABASE, DEVICES);
    await this.clearAndFillDb(DEVICES_GROUPS_DATABASE, DEVICES_GROUPS);
    await this.clearAndFillDb(APPS_DATABASE, APPS);
    await this.clearAndFillDb(APPS_GROUPS_DATABASE, APPS_GROUPS);
  }
}
