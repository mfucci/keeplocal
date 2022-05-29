/**
 * Frontend service serving keeplocal UI.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Service, ServiceBuilder } from "../Service";
import { HTTPService } from "../http/HTTPService";
import express from "express";
import path from "path";
import { DatabaseService } from "../database/DatabaseService";
import { DEVICES_GROUPS_DATABASE } from "../../../common/models/Device";
import {
  App,
  APPS_DATABASE,
  APPS_GROUPS_DATABASE,
  AppType,
} from "../../../common/models/App";
import { Group, UNASSIGNED_GROUP_ID } from "../../../common/models/Group";

const HTTP_ASSETS_DIRECTORY = path.join(__dirname, "public");

export const INSTALLED_GROUP_ID = "installed";

export class FrontService implements Service {
  static Builder: ServiceBuilder<FrontService> = {
    name: "Frontend",
    dependencyBuilders: [HTTPService.Builder, DatabaseService.Builder],
    build: async (httpService: HTTPService, databaseService: DatabaseService) =>
      new FrontService(httpService, databaseService),
  };

  constructor(
    private readonly httpService: HTTPService,
    private readonly databaseService: DatabaseService
  ) {}

  async start(postLaunchHooks: CallableFunction[]) {
    // Create default frontend data if needed
    const databaseManager = this.databaseService.getDatabaseManager();
    await databaseManager.getRecord<Group>(
      DEVICES_GROUPS_DATABASE,
      UNASSIGNED_GROUP_ID,
      () => ({ _id: UNASSIGNED_GROUP_ID, name: "Unassigned", order: 0 })
    );
    await databaseManager.withDatabase<Group>(
      APPS_GROUPS_DATABASE,
      async (database) => {
        await database.getRecord(INSTALLED_GROUP_ID, () => ({
          _id: INSTALLED_GROUP_ID,
          name: "Installed",
          order: 0,
        }));
        await database.getRecord("add_more", () => ({
          _id: "add_more",
          name: "Add more",
          order: 1,
        }));
      }
    );
    await databaseManager.withDatabase<App>(APPS_DATABASE, async (database) => {
      await database.getRecord("app_create", () => ({
        _id: "app_create",
        name: "Create",
        icon: "create.png",
        type: AppType.BuiltIn,
        url: "/app/create",
        groupId: "add_more",
        order: 0,
      }));
    });

    // Static file serving
    const httpServer = this.httpService.getServer();
    httpServer.use("/database.js", (req, res) =>
      res.send(`databaseUrl="${this.databaseService.getDatabaseUrl()}";`)
    );
    httpServer.use(express.static(HTTP_ASSETS_DIRECTORY));

    console.log(`>> Serving frontend at /`);

    postLaunchHooks.push(() =>
      httpServer.use((req, res) =>
        res.sendFile(HTTP_ASSETS_DIRECTORY + "/index.html")
      )
    );
  }
}
