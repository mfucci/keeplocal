import { PERMISSIONS } from "../models/Permissions";

export const PERMISSION_LABELS: {[permission in PERMISSIONS]: string} = {
    [PERMISSIONS.INTERNET]: "Internet",
    [PERMISSIONS.LOCAL_NETWORK]: "Local network",
};
