export interface ScanRequest {
    response?: ScanResponse,
};

export interface ScanResponse {
    ipsToScan: number,
    ipsScanned: number,
};

export const NETWORK_SCAN_DATABASE = "network_scan";
