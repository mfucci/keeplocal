import { Device, DEVICE_CATEGORIES, IpType } from "../../common/models/Device";
import { UNASSIGNED_GROUP_ID } from "../../common/models/Group";
import { vendorForMac } from "../utils/MacUtils";

export function createDevice(mac: string, ipType: IpType): Device {
    return {
        _id: mac,
        name: mac,
        category: DEVICE_CATEGORIES.UNKNOWN,
        vendor: vendorForMac(mac),
        mac,
        permissions: {},
        pending: [],
        ipType,
        groupId: UNASSIGNED_GROUP_ID,
        order: 0,
    };
}
