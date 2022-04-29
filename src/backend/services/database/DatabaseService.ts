import { Service, ServiceBuilder } from "../Service";
import { HTTPService } from "../http/HTTPService";
import { LocalDatabaseManager, LocalPouchDb } from "./LocalDatabaseManager";
import { SETTINGS_DATABASE } from "../../../common/models/Setting";
import expressPouchDB from "express-pouchdb";
import { getPersistentStorageDir } from "../../utils/Paths";
import fs from "fs";
import path from "path";
import { DatabaseManager } from "../../../common/database/DatabaseManager";

const NAME = "Database";

export interface DatabaseSettings {
    urlPath: string,
    logPath: string,
    configPath: string,
}

const DEFAULT_SETTINGS: DatabaseSettings = {
    urlPath: "/database",
    logPath: getPersistentStorageDir("logs") + "database_http.log",
    configPath: getPersistentStorageDir("database") + "config.json",
}

const FAUXTON_BUNDLE_JS = "dashboard.assets/js/bundle-34997e32896293a1fa5d71f79eb1b4f7.js";

export class DatabaseService implements Service {
    static Builder: ServiceBuilder<DatabaseService> = {
        name: "Database",
        dependencyBuilders: [HTTPService.Builder],
        build: async (http: HTTPService) => {
            const { urlPath, logPath, configPath } = await new LocalDatabaseManager().getRecord(SETTINGS_DATABASE, NAME, () => DEFAULT_SETTINGS);
            return new DatabaseService(urlPath, logPath, configPath, http);
        },
    }

    private readonly databaseManager: DatabaseManager;

    constructor(
        private readonly urlPath: string,
        private readonly logPath: string,
        private readonly configPath: string, 
        private readonly httpService: HTTPService) {
            this.databaseManager = new DatabaseManager(`${httpService.getUrl}${urlPath}`);
        }

    async start() {
        const pouchDbApp = expressPouchDB(LocalPouchDb, { logPath: this.logPath, configPath: this.configPath });

        this.httpService.getServer().use(this.urlPath, (req, res, next) => {
            if (req.url.endsWith(FAUXTON_BUNDLE_JS)) {
                res.send(this.patchFauxtonJs(this.urlPath));
            } else {
                return pouchDbApp(req, res, next);
            }
        });
        
        console.log(`>> Serving database at ${this.urlPath}`);
    }

    getDatabaseManager() {
        return this.databaseManager;
    }

    private patchFauxtonJs(urlPath: string) {
        // Hot fix of pouchdb-fauxton@0.0.6 to fix issue https://github.com/pouchdb/pouchdb-fauxton/issues/19
        // If pouchdb-fauxton is updated to merge with upstream fixes in Fauxton, this patch won't be required anymore.
        const jsFile = fs.readFileSync(path.join(__dirname, `../../../../node_modules/pouchdb-fauxton/www/${FAUXTON_BUNDLE_JS}`)).toString();
        return jsFile
            .replace("host:\"../..\"", "host:\"..\"")
            .replace("root:\"/_utils\"", `root:"${urlPath}/_utils"`)
            .replace(/url:\"\/_session/g, `url:"${urlPath}/_session`)
            .replace(/url:\"\/_replicator/g, `url:"${urlPath}/_replicator`)
            .replace(/window\.location\.origin\+\"\/_replicator/g, `window.location.origin+"${urlPath}/_replicator`)
            .replace(/url:\"\/_users/g, `url:"${urlPath}/_users`)
            .replace("window.location.origin+\"/\"+o.default.utils.safeURLName", `window.location.origin+"${urlPath}/"+o.default.utils.safeURLName`)
    }
}
