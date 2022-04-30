import { LocalDatabaseManager } from "../database/LocalDatabaseManager";
import { Service, ServiceBuilder } from "../Service";
import express from "express";

import { SETTINGS_DATABASE } from "../../../common/models/Setting";
import { getPromiseResolver } from "../../utils/Promises";

const NAME = "HTTP";

export interface HTTPSettings {
    port: number,
}

const DEFAULT_SETTINGS: HTTPSettings = {
    port: 8888,
}

export class HTTPService implements Service {
    static Builder: ServiceBuilder<HTTPService> = {
        name: NAME,
        dependencyBuilders: [],
        build: async () => {
            const { port } = await new LocalDatabaseManager().getRecord(SETTINGS_DATABASE, NAME, () => DEFAULT_SETTINGS);
            return new HTTPService(port);
        },
    }

    private readonly server = express();

    constructor(private readonly port: number) {}

    async start() {
        const { promise, resolver } = await getPromiseResolver<void>();
        this.server.listen(this.port, resolver);
        await promise;

        console.log(`>> HTTP server listening on port ${this.port}`);
    }

    getServer() {
        return this.server;
    }

    getUrl() {
        return `http://localhost:${this.port}`;
    }
}
