/**
 * Define network scanning API.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScanRequest {
  response?: ScanResponse;
}

export interface ScanResponse {
  ipsToScan: number;
  ipsScanned: number;
}

export const NETWORK_SCAN_DATABASE = "network_scan";
