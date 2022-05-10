import ping from "ping";

export class PingScanner {
    constructor(
        private readonly workerCount: number
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
        const { alive } = await ping.promise.probe(ip, {timeout: 1, deadline: 1, min_reply: 1});
        if (!alive) return;
        await callback(ip);
    }
}
