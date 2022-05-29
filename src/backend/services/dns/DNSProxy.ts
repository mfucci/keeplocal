/**
 * Proxies DNS request to a downstream DNS server.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import dns from "dns";

import { DNSMessenger, Request } from "./DNSMessenger";

export class DnsProxy {
  readonly resolver = new dns.promises.Resolver();

  constructor(readonly dnsMessenger: DNSMessenger, dnsServerIp: string) {
    this.resolver.setServers([dnsServerIp]);
  }

  async handleRequest(request: Request) {
    const { name, type } = request;
    switch (type) {
      case "A":
        this.dnsMessenger.sendARecords(
          request,
          await this.resolver.resolve4(name, { ttl: true })
        );
        break;
      case "AAAA":
        this.dnsMessenger.sendAAAARecords(
          request,
          await this.resolver.resolve6(name, { ttl: true })
        );
        break;
      case "CNAME":
        this.dnsMessenger.sendCnameRecords(
          request,
          await this.resolver.resolveCname(name)
        );
        break;
      case "TXT":
        this.dnsMessenger.sendTxtRecords(
          request,
          (await this.resolver.resolveTxt(name)).flat()
        );
        break;
      case "MX":
        this.dnsMessenger.sendMxRecords(
          request,
          await this.resolver.resolveMx(name)
        );
        break;
      case "NS":
        this.dnsMessenger.sendNsRecords(
          request,
          await this.resolver.resolveNs(name)
        );
        break;
      case "SOA":
        this.dnsMessenger.sendSoaRecord(
          request,
          await this.resolver.resolveSoa(name)
        );
        break;
      case "SRV":
        this.dnsMessenger.sendSrvRecords(
          request,
          await this.resolver.resolveSrv(name)
        );
        break;
      case "PTR":
        this.dnsMessenger.sendPtrRecords(
          request,
          await this.resolver.resolvePtr(name)
        );
        break;
      default:
        console.log(`Unhandle query type ${type}`);
        return;
    }
  }
}
