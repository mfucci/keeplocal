/** 
 * Holds device data.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupItem } from "./Group";

export const enum DevicePermission {
    INTERNET = "internet",
    LOCAL_NETWORK = "local_network",
}

export const enum IpType {
    STATIC = "STATIC",
    DYNAMIC = "DYNAMIC",
}

export const enum DeviceCategory {
    ROUTER = "router",
    ROUTER_WIFI = "router_wifi",
    PHONE = "phone",
    LAPTOP = "laptop",
    WORKSTATION = "workstation",
    TABLET = "tablet",
    TV = "tv",
    HUB = "hub",
    CAMERA = "camera",
    SMART_SPEAKER = "smart_speaker",
    UNKNOWN = "unknown",
}

export type DevicePermissions = {
    [permission in DevicePermission]?: boolean;
};

export const enum DeviceService {
    SSH,
    HTTP,
}

export interface Device extends GroupItem {
    _id: string,
    name: string,
    category: DeviceCategory,
    vendor: string,
    mac: string,
    permissions: DevicePermissions,
    ipType: IpType,
    lastSeen?: number,
    ip?: string,
    model?: string,
    hostname?: string,
    classId?: string,
    services: DeviceService[],
};

export const DEVICES_DATABASE = "devices";
export const DEVICES_GROUPS_DATABASE = "devices_groups";
