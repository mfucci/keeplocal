/**
 * Utils for handling MAC addresses.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { toVendor } from "@network-utils/vendor-lookup";

/**
 * @param mac MAC address in uppercase format.
 * @returns Vendor name or <unknown> or <random>
 */
export function vendorForMac(mac: string) {
  return toVendor(mac);
}
