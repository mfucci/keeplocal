import os from "os";
import path from "path";
import fs from "fs";

export async function getPersistentStorageDir(key: string) {
    const dirPath = path.join(os.homedir(), ".config", "keeplocal", key) + "/";
    try {
        await fs.promises.stat(dirPath);
    } catch (error) {
        await fs.promises.mkdir(dirPath);
    }
    return dirPath;
}