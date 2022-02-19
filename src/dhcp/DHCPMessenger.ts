/**
 * Messenger for serializing / deserializing inbounding and outbouding DHCP protocol messages.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */
import EventEmitter from "events";
import { BOOTMessageType, DHCPMessageType, DHCPOptions, Packet, ParameterListOption, Socket, AddressRequestOption, HostnameOption, ClassIdOption, DHCPMessageTypeOption, DHCPServerIdOption, SubnetMaskOption, DomainNameOption, AddressTimeOption, GatewaysOption, SocketType, DomainServerOption } from "@network-utils/dhcp";

import { Device, getBroadcastAddress, LEASE_TIME, LOCAL_DOMAIN, Subnet } from "./DHCPServer";
import { BroadcastAddressOption } from "./DHCPLibPatch";

export type Request = {
    transactionId: number,
    flags: number,
    mac: string,
    ip?: string,
    hostname?: string,
    classId?: string,
    requestedIp?: string,
    parameterRequestList?: number[],
}

export declare interface DHCPServerMessenger {
    on(event: "discover", listener: (request: Request) => void): this;
    on(event: "request", listener: (request: Request) => void): this;
}

export class DHCPServerMessenger extends EventEmitter {
    readonly socket: Socket;

    constructor(protocol: SocketType = "udp4") {
        super();
        this.socket = new Socket(protocol);

        this.socket.on("dhcp", ({packet}) => {
            if (packet.op !== BOOTMessageType.request) return;
            const request = toDHCPMessage(packet);
            switch (packet.type) {
                case DHCPMessageType.discover:
                    this.emit("discover", request);
                    break;
                case DHCPMessageType.request:
                    this.emit("request", request);
                    break;
            }
        });
    }

    listen() {
        this.socket.bind();
    }

    close() {
        this.socket.close();
    }

    sendOffer(request: Request, device: Device) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.offer));
        packet.yiaddr = device.ip;
        addParameters(request, packet, device.subnet);
        this.sendResponse(packet, request, device);
    }

    sendAck(request: Request, device: Device) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.ack));
        packet.yiaddr = device.ip;
        addParameters(request, packet, device.subnet);
        this.sendResponse(packet, request, device);
    }

    sendNak(request: Request, device: Device) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.nak));
        packet.options.push(new DHCPServerIdOption(device.subnet.dhcp));
        this.sendResponse(packet, request, device);
    }

    private sendResponse(packet: Packet, request: Request, device: Device) {
        packet.op = BOOTMessageType.reply;
        packet.xid = request.transactionId;
        packet.flags = request.flags;
        packet.chaddr = request.mac;
        packet.siaddr = device.subnet.dhcp;
        this.socket.send(packet);
    }
}

function toDHCPMessage(packet: Packet) {
    const result: Request = {
        transactionId: packet.xid,
        flags: packet.flags,
        mac: packet.chaddr,
        ip: packet.ciaddr,
    };

    packet.options.forEach(option => {
        switch (option.type) {
            case DHCPOptions.ParameterList: result.parameterRequestList = (option as ParameterListOption).value; break;
            case DHCPOptions.AddressRequest: result.requestedIp = (option as AddressRequestOption).value; break;
            case DHCPOptions.Hostname: result.hostname = (option as HostnameOption).value; break;
            case DHCPOptions.ClassId: result.classId = (option as ClassIdOption).value; break;
        }
    });

    return result;
}

function addParameters(request: Request, packet: Packet, subnet: Subnet) {
    packet.options.push(new DHCPServerIdOption(subnet.dns));
    packet.options.push(new AddressTimeOption(LEASE_TIME));

    request.parameterRequestList.forEach(parameter => {
        switch (parameter) {
            case DHCPOptions.SubnetMask: packet.options.push(new SubnetMaskOption(subnet.mask)); break;
            case DHCPOptions.DomainName: packet.options.push(new DomainNameOption(LOCAL_DOMAIN)); break;
            case DHCPOptions.DhcpServerId: packet.options.push(new DHCPServerIdOption(subnet.dhcp)); break;
            case DHCPOptions.Gateways: packet.options.push(new GatewaysOption([subnet.router])); break;
            case DHCPOptions.DomainServer: packet.options.push(new DomainServerOption([subnet.dns])); break;
            case DHCPOptions.BroadcastAddress: packet.options.push(new BroadcastAddressOption(getBroadcastAddress(subnet))); break;
            // TODO: reply hostname
        }
    });
}
