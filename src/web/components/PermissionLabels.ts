/**
 * Labels of device permissions.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { DEVICE_PERMISSIONS } from "../models/DevicePermissions";

// Note: this array defines the display order
export const PERMISSION_LABELS: {[permission in DEVICE_PERMISSIONS]: string} = {
    [DEVICE_PERMISSIONS.INTERNET]: "Internet",
    [DEVICE_PERMISSIONS.LOCAL_NETWORK]: "Local network",
};
