#!/usr/bin/env node

/**
 * keeplocal main entry point.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import yargs from "yargs";
import table from "text-table";
import { format } from "timeago.js";

import { DatabaseManager } from "../common/database/DatabaseManager";
import {
  Device,
  DEVICES_DATABASE,
  DEVICE_PERMISSIONS,
} from "../common/models/Device";
import { Launcher } from "./services/Launcher";
import { DaemonService } from "./services/daemon/DaemonService";
import {
  DatabaseService,
  DatabaseSettings,
} from "./services/database/DatabaseService";
import { SETTINGS_DATABASE } from "../common/models/Setting";
import { LocalDatabaseManager } from "./services/database/LocalDatabaseManager";
import { HTTPService, HTTPSettings } from "./services/http/HTTPService";

process.on("uncaughtException", (error) => {
  console.error(error);
  throw error;
});

process.on("unhandledRejection", (error) => {
  console.error(error);
  throw error;
});

class CommandLineHandler {
  private async getDatabaseManager() {
    const localDatabaseManager = new LocalDatabaseManager();
    const httpSettings = await localDatabaseManager.getRecord<HTTPSettings>(
      SETTINGS_DATABASE,
      HTTPService.Builder.name
    );
    const databaseSettings =
      await localDatabaseManager.getRecord<DatabaseSettings>(
        SETTINGS_DATABASE,
        DatabaseService.Builder.name
      );

    return new DatabaseManager(
      `http://localhost:${httpSettings.port}${databaseSettings.baseUrlPath}${databaseSettings.dataUrlPath}`
    );
  }

  async listDevices() {
    const devices = await (
      await this.getDatabaseManager()
    ).withDatabase<Device, Device[]>(DEVICES_DATABASE, (database) =>
      database.getRecords()
    );
    console.log(
      table([
        ["Name", "IP", "MAC", "State", "Hostname", "ClassID", "Last seen"],
        ...devices.map(
          ({
            name,
            ip,
            ipType,
            mac,
            vendor,
            permissions,
            classId,
            hostname,
            lastSeen,
          }) => [
            name,
            `${ip} (${ipType})`,
            `${mac} (${vendor})`,
            permissions[DEVICE_PERMISSIONS.INTERNET] ? "GATED" : "UNGATED",
            hostname ?? "",
            classId ?? "",
            lastSeen ? format(lastSeen) : "N/A",
          ]
        ),
      ])
    );
  }

  async gateDevice(id: string) {
    await (
      await this.getDatabaseManager()
    ).withDatabase<Device>(DEVICES_DATABASE, async (database) => {
      const device = await database.getRecord(id);
      device.permissions[DEVICE_PERMISSIONS.INTERNET] = false;
      await database.updateRecord(device);
    });
  }

  async ungateDevice(id: string) {
    await (
      await this.getDatabaseManager()
    ).withDatabase<Device>(DEVICES_DATABASE, async (database) => {
      const device = await database.getRecord(id);
      device.permissions[DEVICE_PERMISSIONS.INTERNET] = true;
      await database.updateRecord(device);
    });
  }

  async renameDevice(id: string, name: string) {
    await (
      await this.getDatabaseManager()
    ).withDatabase<Device>(DEVICES_DATABASE, async (database) => {
      const device = await database.getRecord(id);
      await database.updateRecord({ ...device, name });
    });
  }

  startDaemon() {
    new Launcher()
      .start(DaemonService.Builder)
      .catch((error) => console.log(error));
  }
}

const commandLineHandler = new CommandLineHandler();

// eslint-disable-next-line no-unused-expressions
yargs
  .scriptName("keeplocal")
  .command("daemon", "Start keeplocal daemon (requires root)", {}, () =>
    commandLineHandler.startDaemon()
  )
  .command("list", "List devices", {}, () => commandLineHandler.listDevices())
  .command(
    "gate <deviceMac>",
    "Gate device cloud connectivity",
    (yargs) =>
      yargs.positional("deviceMac", {
        type: "string",
        describe: "Mac address",
      }),
    ({ deviceMac }) => commandLineHandler.gateDevice(deviceMac as string)
  )
  .command(
    "ungate <deviceMac>",
    "Ungate device cloud connectivity",
    (yargs) =>
      yargs.positional("deviceMac", {
        type: "string",
        describe: "Mac address",
      }),
    ({ deviceMac }) => commandLineHandler.ungateDevice(deviceMac as string)
  )
  .command(
    "rename <deviceMac> <name>",
    "Rename a device",
    (yargs) =>
      yargs
        .positional("deviceMac", { type: "string", describe: "Mac address" })
        .positional("name", { type: "string", describe: "New name" }),
    ({ deviceMac, name }) =>
      commandLineHandler.renameDevice(deviceMac as string, name as string)
  )
  .demandCommand().argv;
