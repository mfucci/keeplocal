/** 
 * Holds device data.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEVICE_CATEGORIES } from "./DeviceCategories";
import { DEVICE_PERMISSIONS } from "./DevicePermissions";
import { GroupItem } from "./Group";

export type Device = GroupItem & {
    _id: string,
    name: string,
    category?: DEVICE_CATEGORIES,
    vendor?: string,
    online?: boolean,
    ip?: string,
    mac: string,
    vendorFromMac?: string,
    model?: string,
    hostname?: string,
    permissions: {
        [permission in DEVICE_PERMISSIONS]?: boolean;
    }
};

export const DEVICES_DATABASE = "devices";
export const DEVICES_GROUPS_DATABASE = "devices_groups";
