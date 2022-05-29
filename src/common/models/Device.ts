/**
 * Holds device data.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupItem } from "./Group";

export const enum DEVICE_PERMISSIONS {
  INTERNET = "internet",
  LOCAL_NETWORK = "local_network",
}

export enum IpType {
  STATIC = "STATIC",
  DYNAMIC = "DYNAMIC",
}

export const enum DEVICE_CATEGORIES {
  ROUTER = "router",
  ROUTER_WIFI = "router_wifi",
  PHONE = "phone",
  LAPTOP = "laptop",
  WORKSTATION = "workstation",
  TABLET = "tablet",
  TV = "tv",
  HUB = "hub",
  CAMERA = "camera",
  SMART_SPEAKER = "smart_speaker",
  UNKNOWN = "unknown",
}

export type Permissions = {
  [permission in DEVICE_PERMISSIONS]?: boolean;
};

export interface Device extends GroupItem {
  _id: string;
  name: string;
  category: DEVICE_CATEGORIES;
  vendor: string;
  mac: string;
  permissions: Permissions;
  ipType: IpType;
  lastSeen?: number;
  ip?: string;
  model?: string;
  hostname?: string;
  classId?: string;
}

export const DEVICES_DATABASE = "devices";
export const DEVICES_GROUPS_DATABASE = "devices_groups";
