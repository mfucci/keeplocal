import mdns from "multicast-dns";
import { getPromiseResolver } from "../../utils/Promises";
import { RecordType, StringAnswer, TxtAnswer } from "dns-packet";

const MDNS_SCAN_DURATION_MS = 2000;

export class MdnsScanner {

    constructor() {}

    async scan() {
        const mdnsClient = mdns();

        const services = await this.query(mdnsClient, "_services._dns-sd._udp.local", "PTR");

        for (const service of services) {
            const devices = await this.queryDevices(mdnsClient, service, "PTR");
            console.log(service, devices);
        }
        //const devices = await this.queryDevices(mdnsClient, "_apt_proxy._tcp.local", "PTR");
        //console.log(devices);

        mdnsClient.destroy();
    }

    private async query(mdnsClient: mdns.MulticastDNS, name: string, type: RecordType) {
        const answers = new Set<string>();

        function onResponse(response: mdns.ResponsePacket) {
            response.answers.forEach(answer => {
                if (answer.name !== name || answer.type !== type) return;
                answers.add((answer as StringAnswer).data);
            });
        }
        
        mdnsClient.on("response", onResponse);
        mdnsClient.query([{ name, type }]);

        const { promise, resolver } = await getPromiseResolver<void>();
        setTimeout(resolver, MDNS_SCAN_DURATION_MS);
        await promise;

        mdnsClient.off("response", onResponse);

        return answers;
    }

    private async queryDevices(mdnsClient: mdns.MulticastDNS, name: string, type: RecordType) {
        const devices = new Array<{localName: string, service: string, ip?: string, info?: string}>();

        function onResponse(response: mdns.ResponsePacket) {
            const answers = response.answers.concat(response.additionals);
            const localNameAnswer = answers.find(answer => answer.type === "PTR" && answer.name === name) as StringAnswer | undefined;
            if (localNameAnswer === undefined) return;
            const ipAnswer = answers.find(answer => answer.type === "A") as StringAnswer | undefined;
            const extraAnswer = answers.find(answer => answer.type === "TXT") as TxtAnswer | undefined;

            const localName = ipAnswer?.name as string;
            const service = localNameAnswer.data;
            const ip = ipAnswer?.data;
            const info = extraAnswer?.data.toString();

            devices.push({localName, service, ip, info});
        }
        
        mdnsClient.on("response", onResponse);
        mdnsClient.query([{ name, type }]);

        const { promise, resolver } = await getPromiseResolver<void>();
        setTimeout(resolver, MDNS_SCAN_DURATION_MS);
        await promise;

        mdnsClient.off("response", onResponse);

        return devices;
    }
}
