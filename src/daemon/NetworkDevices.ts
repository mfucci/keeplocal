/**
 * NetworkDevice database.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { InternalRecord, RecordDatabase } from "../database/RecordDatabase";


export enum IpType {
    STATIC = "STATIC",
    DYNAMIC = "DYNAMIC",
}

export enum State {
    UNGATED = "UNGATED",
    GATED = "GATED",
}

export type NetworkDevice = {
    mac: string,
    name: string,
    state: State,
    ip: string,
    ipType: IpType,
    pendingChanges: boolean,
    vendor: string,
    classId?: string,
    hostname?: string,
    lastSeen?: number,
}

const DEVICES_RECORD = "/devices";
const DEVICE_RECORD_PREFIX = "/device/";

interface DeviceRecordEventMap {
    "name_update": [name: string],
    "state_update": [state: State],
    "update": [value: NetworkDevice],
}

export declare interface DeviceRecord {
    on<K extends keyof DeviceRecordEventMap>(event: K, listener: (...value: DeviceRecordEventMap[K]) => void): this;
    once<K extends keyof DeviceRecordEventMap>(event: K, listener: (...value: DeviceRecordEventMap[K]) => void): this;
    emit<K extends keyof DeviceRecordEventMap>(event: K, ...value: DeviceRecordEventMap[K]): boolean;
}

export class DeviceRecord extends InternalRecord<NetworkDevice> {
    set(update: NetworkDevice) {
        const device = this.get();
        const { name: previousName, state: previousState } = device;
        const { name, state } = update;
        var updated = false;

        if (name !== undefined && name !== previousName) {
            device.name = name;
            this.emit("name_update", name);
            updated = true;
        }

        if (state !== undefined && state !== previousState) {
            device.state = state;
            this.emit("state_update", state);
            updated = true;
        }

        if (updated) {
            super.set(device);
        }
    }

    setDevice(device: NetworkDevice) {
        super.set(device);
    }
}

interface NetworkDevicesDatabaseEventMap {
    "name_update": [deviceId: string, name: string],
    "state_update": [deviceId: string, state: State],
}

export declare interface NetworkDevicesDatabase {
    on<K extends keyof NetworkDevicesDatabaseEventMap>(event: K, listener: (...value: NetworkDevicesDatabaseEventMap[K]) => void): this;
    once<K extends keyof NetworkDevicesDatabaseEventMap>(event: K, listener: (...value: NetworkDevicesDatabaseEventMap[K]) => void): this;
    emit<K extends keyof NetworkDevicesDatabaseEventMap>(event: K, ...value: NetworkDevicesDatabaseEventMap[K]): boolean;
}

export class NetworkDevicesDatabase extends RecordDatabase {
    setDevices(devices: NetworkDevice[]) {
        const deviceIds = new Array<string>();
        devices.forEach(device => {
            const deviceId = device.mac;
            deviceIds.push(deviceId);
            this.createDeviceRecord(device);
        });
        this.setInternalRecord(DEVICES_RECORD, new InternalRecord(deviceIds));
    }

    updateDevice(device: NetworkDevice) {
        const deviceId = device.mac;
        const key = DEVICE_RECORD_PREFIX + deviceId;
        const record = this.getInternalRecord(key) as DeviceRecord;
        if (record === undefined) {
            this.createDeviceRecord(device);
            const devicesRecord = this.getInternalRecord(DEVICES_RECORD);
            const deviceIds = devicesRecord?.get();
            deviceIds.push(deviceId);
            devicesRecord?.set(deviceIds);
        } else {
            record.setDevice(device);
        }
    }

    private createDeviceRecord(device: NetworkDevice) {
        const deviceId = device.mac;
        const deviceRecord = new DeviceRecord(device);
        deviceRecord.on("name_update", name => this.emit("name_update", deviceId, name));
        deviceRecord.on("state_update", state => this.emit("state_update", deviceId, state));
        this.setInternalRecord(DEVICE_RECORD_PREFIX + deviceId, deviceRecord);
    }
}
