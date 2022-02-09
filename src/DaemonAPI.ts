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
    listDevices(): DeviceWithStatus[],
    gateDevice(deviceMac: string): void,
    freeDevice(deviceMac: string): void,
};
