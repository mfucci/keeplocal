/**
 * API to control the daemon.
 */
import { Device } from "./DHCPServer";

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
