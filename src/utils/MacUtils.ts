export function isRandomMac(mac: string) {
    return mac[1] in ["2", "6", "a", "e"];
}