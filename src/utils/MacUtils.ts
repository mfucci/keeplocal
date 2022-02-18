/**
 * Utils for handling MAC addresses.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @param mac MAC address in uppercase format.
 * @returns true if it is a random MAC address
 */
export function isRandomMac(mac: string) {
    return ["2", "6", "A", "E"].includes(mac.charAt(1));
}