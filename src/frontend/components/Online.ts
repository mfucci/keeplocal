/**
 * Determine if a device is online or not based on the lastSeen value.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Device } from "../../common/models/Device";

const ONLINE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export function isOnline(now: number, { lastSeen }: Device) {
  return lastSeen && now - lastSeen < ONLINE_DURATION_MS;
}
