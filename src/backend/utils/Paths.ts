import os from "os";
import path from "path";
import fs from "fs";

export function getPersistentStorageDir(key: string) {
    const dirPath = path.join(os.homedir(), ".config", "keeplocal", key) + "/";
    try {
        fs.statSync(dirPath);
    } catch (error) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
}
