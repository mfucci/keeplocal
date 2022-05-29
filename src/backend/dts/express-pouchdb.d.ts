/**
 * Type definitions for express-pouchdb
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

declare module "express-pouchdb" {
  import PouchDB from "pouchdb";

  type AppAddOns = {
    setPouchDB(pouchdb: any);
    couchConfig: any;
    couchLogger: any;
  };

  type Config = {
    configPath?: string;
    logPath?: string;
    inMemoryConfig?: boolean;
    mode?: "fullCouchDB" | "minimumForPouchDB" | "custom";
    overrideMode?: {
      include?: string[];
      exclude?: string[];
    };
  };

  export default function (pouchdb: any, config?: Config): Express & AppAddOns;
}
