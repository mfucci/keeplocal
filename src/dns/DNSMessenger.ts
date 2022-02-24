/**
 * Messenger for serializing / deserializing inbounding and outbouding DNS protocol messages.
 * It isolates the higher logic from the underlying library used for messages serialization / deserialization.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAaaaRecord, createARecord, createCnameRecord, createMxRecord, createNsRecord, createSoaRecord, createSrvRecord, createTxtRecord, Server } from "denamed";
import Query from "denamed/dist/query";
import { MxRecord, RecordWithTtl, SoaRecord, SrvRecord } from "dns";
import EventEmitter from "events";

export type Request = {
    readonly name: string,
    readonly type: string,
    readonly query: Query,
};


export declare interface DNSMessenger {
    on(event: "request", listener: (request: Request) => void): this;
}

export class DNSMessenger extends EventEmitter {
    readonly server: Server;

    constructor(port: number) {
        super();
        this.server = new Server({ port });
        this.server.on("query", query => this.handleQuery(query));
    }

    async start() {
        await this.server.start();
        return this.server;
    }

    private handleQuery(query: Query) {
        this.emit("request", { name: query.name, type: query.type, query });
    }

    sendARecords({ name, query }: Request, records: RecordWithTtl[]) {
        records.forEach(({ address, ttl }) => query.addAnswer(name, createARecord(address), ttl));
        this.server.send(query);
    }

    sendAAAARecords({ name, query }: Request, records: RecordWithTtl[]) {
        records.forEach(({ address, ttl }) => query.addAnswer(name, createAaaaRecord(address), ttl));
        this.server.send(query);
    }

    sendCnameRecords({ name, query }: Request, records: string[]) {
        records.forEach(cname => query.addAnswer(name, createCnameRecord(cname)));
        this.server.send(query);
    }

    sendTxtRecords({ name, query }: Request, records: string[]) {
        records.forEach(txt => query.addAnswer(name, createTxtRecord(txt)));
        this.server.send(query);
    }

    sendMxRecords({ name, query }: Request, records: MxRecord[]) {
        records.forEach(mx => query.addAnswer(name, createMxRecord(mx)));
        this.server.send(query);
    }

    sendNsRecords({ name, query }: Request, records: string[]) {
        records.forEach(ns => query.addAnswer(name, createNsRecord(ns)));
        this.server.send(query);
    }

    sendSoaRecord({ name, query }: Request, { nsname, hostmaster, serial, refresh, retry, expire, minttl }: SoaRecord) {
        query.addAnswer(name, createSoaRecord({ host: nsname, admin: hostmaster, expire, refresh, retry, serial, ttl: minttl }));
        this.server.send(query);
    }

    sendSrvRecords({ name, query }: Request, records: SrvRecord[]) {
        records.forEach(({ name: target, port, priority, weight }) => query.addAnswer(name, createSrvRecord({ port, target, priority, weight })));
        this.server.send(query);
    }

    sendPtrRecords({ name, query }: Request, records: string[]) {
        records.forEach(cname => query.addAnswer(name, createCnameRecord(cname)));
        this.server.send(query);
    }
}
