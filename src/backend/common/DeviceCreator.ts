/**
 * Creates a new device object with default values.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Device,
  DEVICE_CATEGORIES,
  IpType,
  Permissions,
} from "../../common/models/Device";
import { UNASSIGNED_GROUP_ID } from "../../common/models/Group";
import { vendorForMac } from "../utils/MacUtils";

export function createDevice(
  mac: string,
  ipType: IpType,
  permissions: Permissions = {}
): Device {
  return {
    _id: mac,
    name: mac,
    category: DEVICE_CATEGORIES.UNKNOWN,
    vendor: vendorForMac(mac),
    mac,
    ipType,
    permissions,
    groupId: UNASSIGNED_GROUP_ID,
    order: 0,
  };
}
