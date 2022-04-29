import { Device } from "../../common/models/Device";

const ONLINE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export function isOnline(now: number, { lastSeen }: Device) {
    return lastSeen && (now - lastSeen) < ONLINE_DURATION_MS;
}
