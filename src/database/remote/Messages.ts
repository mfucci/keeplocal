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

export interface CLIENT_MESSAGE_MAP {
   "connect": RecordKey,
   "update": RecordKeyValue,
   "disconnect": RecordKey,
}

export interface SERVER_MESSAGE_MAP {
   "connect": ResponseCode & RecordValue,
   "update": ResponseCode & RecordValue,
   "disconnect": ResponseCode,
   "remote_update": RecordKeyValue,
}
