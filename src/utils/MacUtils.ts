/**
 * Utils for handling MAC addresses.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

 import vendorPerMac from "@network-utils/arp-lookup/dist/vendors";

/**
 * @param mac MAC address in uppercase format.
 * @returns true if it is a random MAC address
 */
export function isRandomMac(mac: string) {
    return ["2", "6", "A", "E"].includes(mac.charAt(1));
}

/**
 * @param mac MAC address in uppercase format.
 * @returns Vendor name or <unknown> or <random>
 */
export function vendorForMac(mac: string) {
    if (isRandomMac(mac)) return "<random>";
    return vendorPerMac.find(({id}) => mac.startsWith(id))?.cn ?? "<unknown>";
}