/** 
 * Holds common app data.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { GroupItem } from "./Group"

export type App = GroupItem & {
    _id: string,
    name: string,
    icon: string,
};

export const APPS_DATABASE = "apps";
export const APPS_GROUPS_DATABASE = "apps_groups";
