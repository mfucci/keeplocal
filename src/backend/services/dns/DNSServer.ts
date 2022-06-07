/**
 * A simple DNS server.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from "events";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { LoggerService, NetworkEventLogger } from "../logger/LoggerService";
import { DNSMessenger, Request } from "./DNSMessenger";
import { DnsProxy } from "./DNSProxy";
import { DnsService } from "./DnsService";
import fetch from "node-fetch";
import { parse } from "csv-parse";
import { DNS_BLACKLIST_DOC, DNS_DEFAULT_BLACKLIST_DATABASE, DNS_BLACKLIST } from "../../../common/models/Dns"
import { Entry } from "../../../common/database/Database";
import { DnsEvent } from "../../../common/models/NetworkEvent";


const TTL = 30 * 60; // 30 mn
const PORT = 53;

export class DnsServer extends EventEmitter {
  private readonly dnsMessenger: DNSMessenger = new DNSMessenger(PORT);
  private readonly dnsProxy: DnsProxy;
  private readonly logger: NetworkEventLogger<DnsEvent>;
  constructor(
    downstreamDnsServer: string, 
    private readonly loggerService: LoggerService, 
    private readonly databaseManager: DatabaseManager
  ) {
    super();
    this.logger = this.loggerService.getNetworkEventLogger(DnsService.Builder.name);
    this.dnsProxy = new DnsProxy(this.dnsMessenger, downstreamDnsServer, this.databaseManager, this.logger);
    this.dnsMessenger.on("request", request => this.handleRequest(request));
  }
  start() {
    this.dnsMessenger.start()
      .then(server => console.log(`DNS server listening on ${server.address}:${server.port}...`))
      .catch(console.error);
    // might be better to set this up as an install script.
    this.initBlacklist();
  }
  private async initBlacklist() {
    const save_blacklist = async (list: DNS_BLACKLIST) => {
      try {
        const current = await this.databaseManager.getRecord<Entry<DNS_BLACKLIST_DOC>>(DNS_DEFAULT_BLACKLIST_DATABASE, 'default_blacklist');
        await this.databaseManager.updateRecord(DNS_DEFAULT_BLACKLIST_DATABASE, {
          ...current,
          list
        });
      } catch (e) {
        await this.databaseManager.addRecord(DNS_DEFAULT_BLACKLIST_DATABASE, {
          _id: 'default_blacklist',
          list
        });
      }
    }
    try {
      const res = await fetch('https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts', { method: 'GET' });
      const data = await res.text()
      const list: DNS_BLACKLIST = {};
      const parser = parse(data, {
        comment: '#',
        delimiter: ' ',
        trim: true,
        skipEmptyLines: true,
        relaxColumnCount: true
      });
      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          if (record.length > 2) continue;
          list[record[1]] = '0.0.0.0'
        }
      })
      parser.on('error', function(e) {
        console.log('unable to get blocklist');
        console.error(e);
      })
      parser.on('end', async function() {
        await save_blacklist(list);
      })
    } catch (e) {
      console.log('Unable to get block list')
      console.error(e);
    }
  }
  private async handleRequest(request: Request) {
    const { name, type, query: { _client: { address } } } = request;
    this.dnsProxy.handleRequest(request);
    return;

    /*const device = this.dhcpServer.getDeviceByMac(resolvedMac);
    if (device === undefined) return;
    this.dnsMessenger.sendARecords(request, [{ address: device.ip, ttl: TTL }]);*/
  }
}
