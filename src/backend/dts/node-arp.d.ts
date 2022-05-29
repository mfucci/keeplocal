/**
 * Type definitions for node-arp
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

declare module "node-arp" {
  export function getMAC(ip: string, callback: (err: any, mac: string) => void);
}
