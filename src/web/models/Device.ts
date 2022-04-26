/** 
 * Holds device data.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEVICE_CATEGORIES } from "./DeviceCategories";
import { DEVICE_PERMISSIONS } from "./DevicePermissions";

export type Device = {
    id: string,
    name: string,
    groupId: number,
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

export const DEVICE_LIST_KEY = "/devices";
export const DEVICE_GROUP_LIST_KEY = "/devices/groups";
export const DEVICE_KEY_BY_ID = (id: string) => `/device/${id}`;