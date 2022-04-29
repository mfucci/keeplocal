import { Service, ServiceBuilder } from "../Service";
import { HTTPService } from "../http/HTTPService";
import express from "express";
import path from "path";

export class FrontService implements Service {
    static Builder: ServiceBuilder<FrontService> = {
        name: "Frontend",
        dependencyBuilders: [HTTPService.Builder],
        build: async (httpService: HTTPService) => new FrontService(httpService),
    }

    constructor(readonly httpService: HTTPService) {}

    async start() {
        // TODO: frontend data creation


        // Static file serving
        this.httpService.getServer().use(express.static(path.join(__dirname, "public")));
        
        console.log(`>> Serving frontend at /`);
    }
}
