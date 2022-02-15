import Preferences from "preferences";
import * as os from "os";
import * as path from "path";

export class Settings {
    private readonly pref: Preferences;

    constructor(name: string) {
        this.pref = new Preferences(
            name,
            undefined,
            {
                file: path.join(os.homedir(), ".config", "keeplocal", name),
                format: "yaml",
                encrypt: false,
            },
        );
    }

    getSetting<T>(key: string) {
        var result = this.pref[key] as T;
        if (result === undefined) {
            result = {} as T;
            this.pref[key] = result;
        }
        return result;
    }

    save() {
        this.pref.save();
    }
}
