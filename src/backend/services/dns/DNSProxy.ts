/**
 * Proxies DNS request to a downstream DNS server.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import dns from "dns";
import { Entry } from "../../../common/database/Database";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { Device, DEVICES_DATABASE } from "../../../common/models/Device";
import { DNS_BLACKLIST_DOC, DNS_DEFAULT_BLACKLIST_DATABASE } from "../../../common/models/Dns";
import { DnsEvent } from "../../../common/models/NetworkEvent";
import { NetworkEventLogger } from "../logger/LoggerService";

import { DNSMessenger, Request } from "./DNSMessenger";

export class DnsProxy {
    readonly resolver = new dns.promises.Resolver();

    constructor(
      readonly dnsMessenger: DNSMessenger, 
      dnsServerIp: string,
      readonly databaseManager: DatabaseManager,
      readonly logger: NetworkEventLogger<DnsEvent>
    ) {
        this.resolver.setServers([dnsServerIp]);
    }
    async logQuery({ name, type, query: { _client: { address } } }: Request, {
        handled = false,
        blocked,
        exists
      }: { 
        handled: boolean;
        blocked?: boolean; 
        exists?: boolean;
      }
    ) {
      const devices = await this.databaseManager.getRecords<Device>(DEVICES_DATABASE);
      const device = devices.find(device => device.ip === address);
      if (device) {
        this.logger.log(Date.now(), device, {
          name,
          type,
          handled,
          blocked,
          exists,
        })
      }
    }
    async checkBlocked({name}: Request): Promise<boolean> {
      try {
        const { list } = await this.databaseManager.getRecord<Entry<DNS_BLACKLIST_DOC>>(DNS_DEFAULT_BLACKLIST_DATABASE, 'default_blacklist');
        return list[name] ? true : false;
      } catch({status}) {
        return false;
      }
    }
    async handleARecord(request: Request, name: string): Promise<void> {
      const isBlocked = await this.checkBlocked(request);
      if (isBlocked) {
        throw 'blocked'
      }
      this.dnsMessenger.sendARecords(request, (await this.resolver.resolve4(name, { ttl: true })));
    }

    async handleRequest(request: Request) {
        const { name, type } = request;
        try {
          switch (type) {
            case "A":
              await this.handleARecord(request, name);
              break;
            case "AAAA":
              this.dnsMessenger.sendAAAARecords(request, (await this.resolver.resolve6(name, { ttl: true })));
              break;
            case "CNAME":
              this.dnsMessenger.sendCnameRecords(request, (await this.resolver.resolveCname(name)));
              break;
            case "TXT":
              this.dnsMessenger.sendTxtRecords(request, (await this.resolver.resolveTxt(name)).flat());
              break;
            case "MX":
              this.dnsMessenger.sendMxRecords(request, (await this.resolver.resolveMx(name)));
              break;
            case "NS":
              this.dnsMessenger.sendNsRecords(request, (await this.resolver.resolveNs(name)));
              break;
            case "SOA":
              this.dnsMessenger.sendSoaRecord(request, (await this.resolver.resolveSoa(name)));
              break;
            case "SRV":
              this.dnsMessenger.sendSrvRecords(request, (await this.resolver.resolveSrv(name)));
              break;
            case "PTR":
              this.dnsMessenger.sendPtrRecords(request, (await this.resolver.resolvePtr(name)));
              break;
            default:
              console.log(`Unhandle query type ${type}`);
              this.logQuery(request, {
                handled: false
              })
              return;
          }
          await this.logQuery(request, {
            handled: true,
            exists: true,
            blocked: false
          })
        } catch (e) {
          this.dnsMessenger.sendError(request);
          if (e === 'blocked') {
            await this.logQuery(request, {
              handled: true,
              exists: true,
              blocked: true
            })
            return;
          }
          await this.logQuery(request, {
            handled: true,
            exists: false,
            blocked: false
          })
          return;
        }
    }
}