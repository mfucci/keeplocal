/**
 * Definition of the messages used by the remote database client / server to communicate.
 * 
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export enum RESPONSE_CODE {
    OK = "ok",
    NOT_FOUND = "not_found",
    NOT_AUTHORIZED = "not_authorized"
}

type RecordKey = { readonly key: string };
type RecordValue = { readonly value: any };
type RecordKeyValue = RecordKey & RecordValue;
type ResponseCode = { readonly code: RESPONSE_CODE };

export interface RPC_MAPS {
   [key: string]: { request: any, response: any},
   "connect": { request: RecordKey, response: RecordValue },
   "update": { request: RecordKey, response: RecordValue },
   "disconnect": { request: RecordKey, response: {} },
}

export interface DATABASE_RPC {
   connect(parameters: RecordKey): RecordValue,
   update(parameters: RecordKeyValue): RecordValue,
   disconnect(parameters: RecordKey): {},
}

export type DATABASE_REQUEST_MAP = {
   [RPC_NAME in keyof DATABASE_RPC]: Parameters<DATABASE_RPC[RPC_NAME]>[0];
};

export type DATABASE_RESPONSE_MAP = {
   [RPC_NAME in keyof DATABASE_RPC]: ReturnType<DATABASE_RPC[RPC_NAME]> & ResponseCode;
};

export type CLIENT_MESSAGE_MAP = {
   [RPC_NAME in keyof DATABASE_RPC]: DATABASE_REQUEST_MAP[RPC_NAME];
};

export type SERVER_MESSAGE_MAP = {
   [RPC_NAME in keyof DATABASE_RPC]: DATABASE_RESPONSE_MAP[RPC_NAME] } & {
   "remote_update": RecordKeyValue,
};
