/**
 * Messenger for serializing / deserializing inbounding and outbouding DHCP protocol messages.
 * It isolates the higher logic from the underlying library used for messages serialization / deserialization.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import EventEmitter from "events";
import { BOOTMessageType, DHCPMessageType, DHCPOptions, Packet, ParameterListOption, BroadcastAddressOption, Socket, AddressRequestOption, HostnameOption, ClassIdOption, DHCPMessageTypeOption, DHCPServerIdOption, SubnetMaskOption, DomainNameOption, AddressTimeOption, GatewaysOption, SocketType, DomainServerOption } from "@network-utils/dhcp";

import { DHCPSettings } from "./DHCPService";
import { SUBNET_MASK } from "./DHCPServer";
import * as ipUtil from "ip";

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

    constructor() {
        super();
        this.socket = new Socket("udp4");
        this.socket.on("dhcp", ({packet}) => this.handlePacket(packet));
    }

    listen() {
        // TODO: bind only on one interface otherwise packets might be received multiple times
        this.socket.bind();
    }

    close() {
        this.socket.close();
    }

    private handlePacket(packet: Packet) {
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
    }

    sendOffer(request: Request, settings: DHCPSettings, ip: string, routerIp: string) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.offer));
        packet.yiaddr = ip;
        addParameters(request, packet, settings, routerIp);
        this.sendResponse(packet, request);
    }

    sendAck(request: Request, settings: DHCPSettings, ip: string, routerIp: string) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.ack));
        packet.yiaddr = ip;
        addParameters(request, packet, settings, routerIp);
        this.sendResponse(packet, request);
    }

    sendNak(request: Request, settings: DHCPSettings) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.nak));
        packet.options.push(new DHCPServerIdOption(settings.dhcp_ip));
        this.sendResponse(packet, request);
    }

    private sendResponse(packet: Packet, request: Request) {
        packet.op = BOOTMessageType.reply;
        packet.xid = request.transactionId;
        packet.flags = request.flags;
        packet.chaddr = request.mac;
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

function addParameters(request: Request, packet: Packet, settings: DHCPSettings, routerIp: string) {
    packet.siaddr = settings.dhcp_ip;
    packet.options.push(new DHCPServerIdOption(settings.dhcp_ip));
    packet.options.push(new AddressTimeOption(settings.ip_lease_time_s));

    // TODO: reply hostname
    if (request.hostname) {
        packet.options.push(new HostnameOption(request.hostname));
    }

    request.parameterRequestList?.forEach(parameter => {
        switch (parameter) {
            case DHCPOptions.SubnetMask: packet.options.push(new SubnetMaskOption(SUBNET_MASK)); break;
            case DHCPOptions.DomainName: packet.options.push(new DomainNameOption(settings.local_domain)); break;
            case DHCPOptions.DhcpServerId: packet.options.push(new DHCPServerIdOption(settings.dhcp_ip)); break;
            case DHCPOptions.Gateways: packet.options.push(new GatewaysOption([routerIp])); break;
            case DHCPOptions.DomainServer: packet.options.push(new DomainServerOption([settings.dns_ip])); break;
            case DHCPOptions.BroadcastAddress: packet.options.push(new BroadcastAddressOption(ipUtil.subnet(settings.dhcp_ip, SUBNET_MASK).broadcastAddress)); break;
        }
    });
}
