/**
 * A simple DNS server.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from "events";

import { DHCPServer } from "../dhcp/DHCPServer";
import { Settings } from "../../utils/Settings";
import { DNSMessenger, Request } from "./DNSMessenger";
import { DnsProxy } from "./DNSProxy";

const TTL = 30 * 60; // 30 mn
const PORT = 53;

export class DnsServer extends EventEmitter {
  private readonly settings = new Settings("dhcp");
  private readonly nameToMac = this.settings.getSetting<Record<string, string>>("devices");
  private readonly dnsMessenger: DNSMessenger = new DNSMessenger(PORT);
  private readonly dnsProxy: DnsProxy;

  constructor(downstreamDnsServer: string, readonly dhcpServer: DHCPServer) {
    super();
    this.dnsProxy = new DnsProxy(this.dnsMessenger, downstreamDnsServer);
    this.dnsMessenger.on("request", request => this.handleRequest(request));
  }

  start() {
    this.dnsMessenger.start()
      .then(server => console.log(`DNS server listening on ${server.address}:${server.port}...`))
      .catch(console.error);
  }

  addName(name: string, mac: string) {
    this.nameToMac[name] = mac;
    this.settings.save();
  }

  private async handleRequest(request: Request) {
    const { name, type } = request;
    const resolvedMac = this.nameToMac[name];

    if (resolvedMac === undefined) {
      // no entry, proxy DNS request to downstream DNS server
      this.dnsProxy.handleRequest(request);
      return;
    }

    /*const device = this.dhcpServer.getDeviceByMac(resolvedMac);
    if (device === undefined) return;
    this.dnsMessenger.sendARecords(request, [{ address: device.ip, ttl: TTL }]);*/
  }
}
