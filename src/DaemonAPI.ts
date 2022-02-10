/**
 * API to control the daemon.
 */
import { Device } from "./DHCPServer";

export enum Status {
    FREE = "FREE",
    GATED = "GATED",
}

export type DeviceWithStatus = {
    device: Device,
    status: Status,
}

export interface DaemonAPI {
    /** Returns a list of known devices. */
    listDevices(): DeviceWithStatus[],

    /** Gates a device to prevent it to reach the cloud. */
    gateDevice(deviceMac: string): void,

    /** Frees a device so restore its ability to reach the cloud. */
    freeDevice(deviceMac: string): void,
};
