/**
 * Creates a new device object with default values.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Device, DeviceCategory, IpType } from "../../common/models/Device";
import { UNASSIGNED_GROUP_ID } from "../../common/models/Group";
import * as macUtils from "../utils/MacUtils";

export function generateName(mac: string, hostname?: string) {
    const randomMac = macUtils.isRandom(mac);
    const prefix = randomMac ? "Mobile " : "";
    if (hostname !== undefined) {
        return prefix + hostname;
    }
    if (!randomMac) {
        return macUtils.getVendorForMac(mac).split(" ").slice(0, 2).join(" ");
    }
    return "Mobile";
}

export function createNew(mac: string, ipType: IpType, options?: {name?: string}): Device {
    return {
        _id: mac,
        name: options?.name ?? mac,
        category: DeviceCategory.UNKNOWN,
        vendor: macUtils.getVendorForMac(mac),
        mac,
        ipType,
        permissions: {},
        groupId: UNASSIGNED_GROUP_ID,
        order: 0,
        services: [],
    };
}

export function isOnline(device: Device) {
    return device.lastSeen === undefined ? false : (Date.now() - device.lastSeen) < 10 * 60 * 1000 /* considered offline if not seen for 10mn */;
}
