import { Client, SsdpHeaders } from "node-ssdp";
import { getPromiseResolver } from "../../utils/Promises";
import { get } from "../../utils/UrlUtils";
import { XMLParser } from "fast-xml-parser";

const SSDP_SCAN_DURATION_MS = 3000;

export class SsdpScanner {
    constructor() {}

    async scan() {
        const client = new Client();
        const serviceDescriptionUrls = new Map<string, SsdpHeaders>();

        client.on("response", headers => {
            if (headers.LOCATION === undefined) return;
            serviceDescriptionUrls.set(headers.LOCATION, headers);
        });

        await client.start();

        client.search("ssdp:all");

        const { promise, resolver } = await getPromiseResolver<void>();
        setTimeout(resolver, SSDP_SCAN_DURATION_MS);
        await promise;
        client.stop();

        const parser = new XMLParser();
        [...serviceDescriptionUrls.keys()].map(async serviceDescriptionUrl => {
            const serviceDescription = parser.parse(await get(serviceDescriptionUrl));
            const { root: { device }} = serviceDescription;
            if (device === undefined) return;
            const { deviceType, friendlyName, manufacturer, modelName } = device;
            console.log(deviceType + friendlyName, manufacturer, modelName);
        });
    }   
}
