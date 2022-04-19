/** 
 * Holds the DatabaseManager singleton for reusing the same database connection everywhere.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DatabaseManager } from "./DatabaseManager";

type IDatabaseContext = {
    databaseManager: DatabaseManager,
}

export const DatabaseContext = React.createContext<IDatabaseContext>({} as IDatabaseContext);