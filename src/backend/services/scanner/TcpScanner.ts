import { probe } from "@network-utils/tcp-ping";

export class TcpScanner {
    constructor(
        private readonly workerCount: number,
        private readonly port: number,
    ) {}

    async scan(ipsToScan: string[], callback: (ip: string) => Promise<void>) {
        await Promise.all([...Array(this.workerCount)].map(async () => {
            while (true) {
                const ip = ipsToScan.shift();
                if (ip === undefined) return;
                await this.scanIp(ip, callback);
            }
        }));
    }

    private async scanIp(ip: string, callback: (ip: string) => Promise<void>) {
        const open = await probe(this.port, ip, 1000);
        if (!open) return;
        await callback(ip);
    }
}
