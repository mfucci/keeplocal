/**
 * A simple DNS server.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from "events";
import { DatabaseManager } from "../../../common/database/DatabaseManager";
import { Device, DEVICES_DATABASE, IpType } from "../../../common/models/Device";
import { LoggerService, NetworkEventLogger } from "../logger/LoggerService";
import { DNSMessenger, Request } from "./DNSMessenger";
import { DnsProxy } from "./DNSProxy";
import { DnsService } from "./DnsService";

const TTL = 30 * 60; // 30 mn
const PORT = 53;

export interface DNSEvent {
  name: string; 
  type: string;
}

export class DnsServer extends EventEmitter {
  private readonly dnsMessenger: DNSMessenger = new DNSMessenger(PORT);
  private readonly dnsProxy: DnsProxy;
  private readonly logger: NetworkEventLogger<DNSEvent>;
  constructor(
    downstreamDnsServer: string, 
    private readonly loggerService: LoggerService, 
    private readonly databaseManager: DatabaseManager
  ) {
    super();
    this.dnsProxy = new DnsProxy(this.dnsMessenger, downstreamDnsServer);
    this.dnsMessenger.on("request", request => this.handleRequest(request));
    this.logger = this.loggerService.getNetworkEventLogger(DnsService.Builder.name);
  }
  start() {
    this.dnsMessenger.start()
      .then(server => console.log(`DNS server listening on ${server.address}:${server.port}...`))
      .catch(console.error);
  }

  private async handleRequest(request: Request) {
    const { name, type, query: { _client: {family, address} } } = request;
    const devices = await this.databaseManager.withDatabase<Device, Device[]>(DEVICES_DATABASE, async database => await database.getRecords())
    const device = devices.find((d) => d?.ip === address);
    //TODO need arp.
    if (device) {
      this.logger.log(Date.now(), device, {
        name,
        type
      })
    }
    this.dnsProxy.handleRequest(request);
    return;

    /*const device = this.dhcpServer.getDeviceByMac(resolvedMac);
    if (device === undefined) return;
    this.dnsMessenger.sendARecords(request, [{ address: device.ip, ttl: TTL }]);*/
  }
}
