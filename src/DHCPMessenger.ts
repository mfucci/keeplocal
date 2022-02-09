import EventEmitter = require("events");

import { BOOTMessageType, DHCPMessageType, DHCPOptions, Packet, ParameterListOption, Socket, AddressRequestOption, HostnameOption, ClassIdOption, DHCPMessageTypeOption, DHCPServerIdOption, SubnetMaskOption, DomainNameOption, AddressTimeOption, GatewaysOption, SocketType } from "dhcp-mon";

import { Device, Subnet } from "./DHCPServer";

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

    sendOffer(request: Request, device: Device, subnet: Subnet) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.offer));
        addRequestedParameters(request, packet, subnet);
        packet.yiaddr = device.ip;
        this.sendResponse(packet, request, subnet);
    }

    sendAck(request: Request, device: Device, subnet: Subnet) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.ack));
        packet.yiaddr = device.ip;
        this.sendResponse(packet, request, subnet);
    }

    sendNak(request: Request, device: Device, subnet: Subnet) {
        const packet = new Packet();
        packet.options.push(new DHCPMessageTypeOption(DHCPMessageType.nak));
        packet.options.push(new DHCPServerIdOption(subnet.dhcp));
        this.sendResponse(packet, request, subnet);
    }

    private sendResponse(packet: Packet, request: Request, subnet: Subnet) {
        packet.xid = request.transactionId;
        packet.flags = request.flags;
        packet.chaddr = request.mac;
        packet.siaddr = subnet.dhcp;
        this.socket.send(packet);
    }
}

function toDHCPMessage(packet: Packet) {
    const result: Request = {
        transactionId: packet.xid,
        flags: packet.flags,
        mac: packet.chaddr,
    };

    packet.options.forEach(option => {
        switch (option.type) {
            case DHCPOptions.ParameterList: result.parameterRequestList = (option as ParameterListOption).value; break;
            case DHCPOptions.AddressRequest: result.requestedIp = (option as AddressRequestOption).value; break;
            case DHCPOptions.Hostname: result.hostname = (option as HostnameOption).value; break;
            case DHCPOptions.ClassId: result.hostname = (option as ClassIdOption).value; break;
        }
    });

    return result;
}

function addRequestedParameters(request: Request, packet: Packet, subnet: Subnet) {
    request.parameterRequestList.forEach(parameter => {
        switch (parameter) {
            case DHCPOptions.SubnetMask: packet.options.push(new SubnetMaskOption(subnet.mask)); break;
            case DHCPOptions.DomainName: packet.options.push(new DomainNameOption(subnet.dns)); break;
            case DHCPOptions.AddressTime: packet.options.push(new AddressTimeOption(subnet.leaseTimeSeconds)); break;
            case DHCPOptions.DhcpServerId: packet.options.push(new DHCPServerIdOption(subnet.dhcp)); break;
            case DHCPOptions.Gateways: packet.options.push(new GatewaysOption([subnet.router])); break;
            case DHCPOptions.DomainServer: packet.options.push(new DomainNameOption(subnet.dns)); break;
        }
    });
}
