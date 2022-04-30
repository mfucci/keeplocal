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
    baseUrlPath: string,
    dataUrlPath: string,
    logPath: string,
    configPath: string,
}

const DEFAULT_SETTINGS: DatabaseSettings = {
    baseUrlPath: "/database",
    dataUrlPath: "/data",
    logPath: getPersistentStorageDir("logs") + "database_http.log",
    configPath: getPersistentStorageDir("database") + "config.json",
}

const FAUXTON_BUNDLE_JS = "dashboard.assets/js/bundle-34997e32896293a1fa5d71f79eb1b4f7.js";

export class DatabaseService implements Service {
    static Builder: ServiceBuilder<DatabaseService> = {
        name: "Database",
        dependencyBuilders: [HTTPService.Builder],
        build: async (http: HTTPService) => {
            const settings = await new LocalDatabaseManager().getRecord(SETTINGS_DATABASE, NAME, () => DEFAULT_SETTINGS);
            return new DatabaseService(settings, http);
        },
    }

    private readonly databaseManager: DatabaseManager;

    constructor(
        private readonly settings: DatabaseSettings,
        private readonly httpService: HTTPService) {
            this.databaseManager = new DatabaseManager(this.getDatabaseUrl());
        }

    async start() {
        const { baseUrlPath, dataUrlPath, logPath, configPath } = this.settings;

        const server = this.httpService.getServer();
        server.use(baseUrlPath, (req, res, next) => {
            if (req.url.startsWith(dataUrlPath)) return next();
            req.url = `${dataUrlPath}/_utils${req.url}`;
            req.originalUrl = `${baseUrlPath}${req.url}`;
            next();
        });
        server.use(`${baseUrlPath}${dataUrlPath}/_utils/${FAUXTON_BUNDLE_JS}`, (req, res) => res.send(this.patchFauxtonJs(baseUrlPath, dataUrlPath)));
        server.use(baseUrlPath + dataUrlPath, expressPouchDB(LocalPouchDb, { logPath, configPath }));

        /// Make sure the HTTP database server is aware of settings database created without it
        await this.getDatabaseManager().getDatabase(SETTINGS_DATABASE).getRecords();
        
        console.log(`>> Serving database at ${baseUrlPath}`);
    }

    getUiUrl() {
        return `${this.httpService.getUrl()}${this.settings.baseUrlPath}/`;
    }

    getDatabaseUrl() {
        return `${this.httpService.getUrl()}${this.settings.baseUrlPath}${this.settings.dataUrlPath}`;
    }

    getDatabaseManager() {
        return this.databaseManager;
    }

    private patchFauxtonJs(baseUrl: string, dataUrl: string) {
        const databaseUrl = baseUrl + dataUrl;
        // Hot fix of pouchdb-fauxton@0.0.6 to fix issue https://github.com/pouchdb/pouchdb-fauxton/issues/19
        // If pouchdb-fauxton is updated to merge with upstream fixes in Fauxton, this patch won't be required anymore.
        const jsFile = fs.readFileSync(path.join(__dirname, `../../../../node_modules/pouchdb-fauxton/www/${FAUXTON_BUNDLE_JS}`)).toString();
        return jsFile
            .replace("host:\"../..\"", `host:".${dataUrl}"`)
            .replace("root:\"/_utils\"", `root:"${baseUrl}"`)
            .replace(/url:\"\/_session/g, `url:"${databaseUrl}/_session`)
            .replace(/url:\"\/_replicator/g, `url:"${databaseUrl}/_replicator`)
            .replace(/window\.location\.origin\+\"\/_replicator/g, `window.location.origin+"${databaseUrl}/_replicator`)
            .replace(/url:\"\/_users/g, `url:"${databaseUrl}/_users`)
            .replace("window.location.origin+\"/\"+o.default.utils.safeURLName", `window.location.origin+"${databaseUrl}/"+o.default.utils.safeURLName`)
    }
}
