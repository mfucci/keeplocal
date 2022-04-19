import { DEVICE_CATEGORIES } from "./DeviceCategories";
import { PERMISSIONS } from "./Permissions";

export type Device = {
    name: string,
    groupId: number,
    category?: DEVICE_CATEGORIES,
    vendor?: string,
    online?: boolean,
    ip?: string,
    mac: string,
    vendorFromMac?: string,
    model?: string,
    hostname?: string,
    permissions: {
        [permission in PERMISSIONS]?: boolean;
    }
};