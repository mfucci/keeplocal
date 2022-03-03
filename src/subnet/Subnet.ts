/** 
 * Subnet type and getter to ensure that only one instance is created for each subnet.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export type Subnet = {
    readonly mask: string;
    readonly dhcp: string;
    readonly router: string;
    readonly dns: string;
}

const subnets: Record<string, Subnet> = {};

export function getSubnet({mask, dhcp, router, dns}: Subnet) {
    const key = [mask, dhcp, router, dns].join(";");
    var result = subnets[key];
    if (result === undefined) {
        result = {mask, dhcp, router, dns};
        subnets[key] = result;
    }
    return result;
}

export const SUBNET_MASK = "255.255.255.0";
