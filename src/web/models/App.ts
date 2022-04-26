/** 
 * Holds common app data.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export type App = {
    id: string,
    name: string,
    icon: string,
    groupId: number,
};

export const APP_LIST_KEY = "/apps";
export const APP_GROUP_LIST_KEY = "/apps/groups";
export const APP_KEY_BY_ID = (id: string) => `/app/${id}`;
export const APP_DATA_KEY_BY_ID = (id: string, data: string) => `/app/${id}/${data}`;