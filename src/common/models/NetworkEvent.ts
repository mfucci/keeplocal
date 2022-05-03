/** 
 * Define common structures for network events.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */


export interface NetworkEventLog<T> {
    timestamp: number,
    device_id: string,
    service: string,
    event: T,
}

export const NETWORK_EVENT_DATABASE = "network_events";