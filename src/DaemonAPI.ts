/**
 * API to control the daemon.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */
import { Device } from "./dhcp/DHCPServer";

export enum State {
    UNGATED = "UNGATED",
    GATED = "GATED",
}

export type DeviceWithState = {
    device: Device,
    state: State,
}

export interface DaemonAPI {
    /** Returns a list of known devices. */
    listDevices(): DeviceWithState[],

    /** Gates a device to prevent it to reach the cloud. */
    gateDevice(deviceMac: string): void,

    /** Ungates a device so restore its ability to reach the cloud. */
    ungateDevice(deviceMac: string): void,
};
