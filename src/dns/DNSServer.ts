/**
 * A simple DNS server.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAaaaRecord, createARecord, createCnameRecord, createConsoleLog, createMxRecord, createNsRecord, createSoaRecord, createSrvRecord, createTxtRecord, Server } from "denamed";
import Query from "denamed/dist/query";
import dns from "dns";
import { EventEmitter } from "events";

const PORT = 53;

export class DnsServer extends EventEmitter {
  readonly resolver = new dns.promises.Resolver();
  readonly server = new Server({
    port: PORT,
    log: createConsoleLog(),
  });

  constructor(parentDnsServerIp: string) {
    super();
    this.resolver.setServers([parentDnsServerIp]);
    this.server.on("query", query => this.handleQuery(query));
  }

  start() {
    this.server
      .start()
      .then(server => console.log(`Server listening on ${server.address}:${server.port}...`))
      .catch(console.error);
  }

  async handleQuery(query: Query) {
    const { name, type } = query;
    switch (type) {
      case "A":
        (await this.resolver.resolve4(name, { ttl: true }))
          .forEach(({ address, ttl }) => query.addAnswer(name, createARecord(address), ttl));
        break;
      case "AAAA":
        (await this.resolver.resolve6(name, { ttl: true }))
          .forEach(({ address, ttl }) => query.addAnswer(name, createAaaaRecord(address), ttl));
        break;
      case "CNAME":
        (await this.resolver.resolveCname(name))
          .forEach(cname => query.addAnswer(name, createCnameRecord(cname)));
        break;
      case "TXT":
        (await this.resolver.resolveTxt(name))
          .flat()
          .forEach(txt => query.addAnswer(name, createTxtRecord(txt)));
        break;
      case "MX":
        (await this.resolver.resolveMx(name))
          .forEach(mx => query.addAnswer(name, createMxRecord(mx)));
        break;
      case "NS":
        (await this.resolver.resolveNs(name))
          .forEach(ns => query.addAnswer(name, createNsRecord(ns)));
        break;
      case "SOA":
        const { nsname, hostmaster, serial, refresh, retry, expire, minttl } = await this.resolver.resolveSoa(name);
        query.addAnswer(name, createSoaRecord({ host: nsname, admin: hostmaster, expire, refresh, retry, serial, ttl: minttl }));
        break;
      case "SRV":
        (await this.resolver.resolveSrv(name))
          .forEach(({ name: target, port, priority, weight }) => query.addAnswer(name, createSrvRecord({port, target, priority, weight})));
        break;
      case "PTR":
        (await this.resolver.resolvePtr(name))
          .forEach(cname => query.addAnswer(name, createCnameRecord(cname)));
        break;
      default:
        console.log(`Unhandle query type ${type}`);
        this.server.send(query);
        return;
    }
    this.server.send(query);
  }
}
