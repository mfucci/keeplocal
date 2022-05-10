/**
 * Utils for handling IP addresses.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import * as ipUtil from "ip";
import * as gateway from "default-gateway";
import dns from "dns/promises";

export function getThisDeviceIp() {
    return ipUtil.address();
}

export function getGatewayIp() {
    return gateway.v4.sync().gateway;
}

export function getSubnetPrefix(ip: string, mask: string) {
    return ipUtil.mask(ip, mask).slice(0, -1);
}

export async function getHostname(ip: string) {
    try {
        return (await dns.reverse(ip))[0];
    } catch (error) {
        return undefined;
    }
}
