import { DHCPOptions, IpAddressOption } from "@network-utils/dhcp";

export class BroadcastAddressOption extends IpAddressOption {
    constructor(data?: string) {
        super(DHCPOptions.BroadcastAddress, data);
    }
}