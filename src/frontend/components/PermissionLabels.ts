/**
 * Labels of device permissions.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { DevicePermission } from "../../common/models/Device";

// Note: this array defines the display order
export const PERMISSION_LABELS: {[permission in DevicePermission]: string} = {
    [DevicePermission.INTERNET]: "Internet",
    [DevicePermission.LOCAL_NETWORK]: "Local network",
};
