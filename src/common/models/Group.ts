/** 
 * Define a group of items.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ordered } from "./Ordered";

export interface GroupItem extends Ordered {
    _id: string,
    name: string,
    groupId: string,
}

export interface Group extends Ordered {
    _id: string,
    name: string,
}

export const UNASSIGNED_GROUP_ID = "unassigned";
