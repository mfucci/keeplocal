/**
 * Utils for handling MAC addresses.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { toVendor, isRandomMac } from '@network-utils/vendor-lookup';
import * as ipUtil from "ip";
import * as macAddressHelper from "macaddress";
import arp from "node-arp";
import { getPromiseResolver } from './Promises';

/**
 * @param mac MAC address in uppercase format.
 * @returns Vendor name or <unknown> or <random>
 */
export function getVendorForMac(mac: string) {
    return toVendor(mac);
}

export function isRandom(mac: string) {
    return isRandomMac(mac);
}

export async function getMacForIp(ip: string) {
    if (ip === ipUtil.address()) {
        // This is the ip of this device
        return (await macAddressHelper.one()).toUpperCase();
    }
    const { promise, resolver } = await getPromiseResolver<string | undefined>();
    arp.getMAC(ip, (err, mac) => {
        if (err) {
            console.log(JSON.stringify(err));
            resolver(undefined);
        }
        resolver(mac);
    });
    return (await promise)?.toUpperCase();
}
