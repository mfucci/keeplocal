import http from "http";
import https from "https";

export async function get(url: string) {
    const fetcher = url.startsWith("https:") ? https : http;

    return new Promise<string>((resolve, reject) => {
        const request = fetcher.get(url, response => {
            if (response.statusCode === undefined || response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Status Code: ${response.statusCode}`));
            }
            const data: any[] = [];
            response.on("data", chunk => {
                data.push(chunk);
            });
            response.on("end", () => resolve(Buffer.concat(data).toString()));
        });
        request.on("error", reject);
        request.end();
    });
}
