/**
 * Stream of messages.
 *
 * Allows to use simultanously on the same channel RPC and event based protocols.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { EventEmitter } from "events";
import { getPromiseResolver } from "../utils/Promises";
import { ERROR, Stream } from "./Stream";

type MessageWrapper<M, K extends keyof M> = {
  type: K;
  requestId?: number;
  message: M[K];
};

export type MessageWrappers<M> = MessageWrapper<M, keyof M>;

interface MessageStreamEventMap {
  closed: [];
  error: [error: Error];
}

type REQUEST<K> = K extends string | number ? `${K}_request` : never;

export declare interface MessageStream<READ_MESSAGE_MAP, WRITE_MESSAGE_MAP> {
  on<K extends keyof MessageStreamEventMap>(
    event: K,
    listener: (...value: MessageStreamEventMap[K]) => void
  ): this;
  once<K extends keyof MessageStreamEventMap>(
    event: K,
    listener: (...value: MessageStreamEventMap[K]) => void
  ): this;
  emit<K extends keyof MessageStreamEventMap>(
    event: K,
    ...value: MessageStreamEventMap[K]
  ): boolean;
  on<K extends keyof READ_MESSAGE_MAP>(
    event: K,
    listener: (message: READ_MESSAGE_MAP[K]) => void
  ): this;
  once<K extends keyof READ_MESSAGE_MAP>(
    event: K,
    listener: (message: READ_MESSAGE_MAP[K]) => void
  ): this;
  emit<K extends keyof READ_MESSAGE_MAP>(
    event: K,
    message: READ_MESSAGE_MAP[K]
  ): boolean;
  on<K extends keyof READ_MESSAGE_MAP>(
    event: REQUEST<K>,
    listener: (message: READ_MESSAGE_MAP[K], requestId: number) => void
  ): this;
  once<K extends keyof READ_MESSAGE_MAP>(
    event: REQUEST<K>,
    listener: (message: READ_MESSAGE_MAP[K], requestId: number) => void
  ): this;
  emit<K extends keyof READ_MESSAGE_MAP>(
    event: REQUEST<K>,
    message: READ_MESSAGE_MAP[K],
    requestId: number
  ): boolean;
}

export class MessageStream<
  READ_MESSAGE_MAP,
  WRITE_MESSAGE_MAP
> extends EventEmitter {
  private pendingRead?: {
    waitingFor: keyof READ_MESSAGE_MAP;
    resolver: (message: any) => void;
    rejecter: (reason: any) => void;
  };
  private readonly pendingResponses = new Map<
    number,
    { resolver: (message: any) => void; rejecter: (reason: any) => void }
  >();
  private requestCount = 0;
  private closed = false;

  constructor(
    readonly stream: Stream<
      MessageWrappers<READ_MESSAGE_MAP>,
      MessageWrappers<WRITE_MESSAGE_MAP>
    >
  ) {
    super();
    stream.on("closed", () => this.handleStreamClose());
    this.readingLoop().catch((error) => this.handleError(error));
  }

  async write<K extends keyof WRITE_MESSAGE_MAP>(
    type: K,
    message: WRITE_MESSAGE_MAP[K]
  ) {
    if (this.closed) throw new Error("The stream is closed");
    await this.stream.write({ type, message });
  }

  async respond<K extends keyof WRITE_MESSAGE_MAP>(
    type: K,
    requestId: number,
    message: WRITE_MESSAGE_MAP[K]
  ) {
    if (this.closed) throw new Error("The stream is closed");
    await this.stream.write({ type, requestId, message });
  }

  async read<K extends keyof READ_MESSAGE_MAP>(
    type: K
  ): Promise<READ_MESSAGE_MAP[K]> {
    const { promise, resolver, rejecter } = await getPromiseResolver<
      READ_MESSAGE_MAP[K]
    >();
    if (this.closed) throw new Error("The stream is closed");
    if (this.pendingRead !== undefined)
      throw new Error("Only one reading request can be active at one time");
    this.pendingRead = { waitingFor: type, resolver, rejecter };
    return promise;
  }

  async request<
    K extends keyof WRITE_MESSAGE_MAP,
    R extends keyof READ_MESSAGE_MAP
  >(
    request: K,
    message: WRITE_MESSAGE_MAP[K],
    response: R
  ): Promise<READ_MESSAGE_MAP[R]> {
    const { promise, resolver, rejecter } = await getPromiseResolver<
      READ_MESSAGE_MAP[R]
    >();
    if (this.closed) throw new Error("The stream is closed");
    const requestId = this.requestCount++;
    await this.stream.write({ type: request, requestId, message });
    this.pendingResponses.set(requestId, { resolver, rejecter });
    return promise;
  }

  async close() {
    this.closed = true;
    await this.stream.close();
  }

  private async readingLoop() {
    while (!this.closed) {
      const messageWrapper = await this.stream.read();
      const { type, message, requestId } = messageWrapper;
      if (requestId !== undefined) {
        const eventType = `${type}_request` as REQUEST<keyof READ_MESSAGE_MAP>;
        if (this.eventNames().includes(eventType)) {
          this.emit(eventType, message, requestId);
          continue;
        }
        const pendingResponse = this.pendingResponses.get(requestId);
        if (pendingResponse === undefined)
          throw new Error(
            `Unexpected response ${JSON.stringify(messageWrapper)}`
          );
        pendingResponse.resolver(message);
        this.pendingResponses.delete(requestId);
        continue;
      }
      if (this.eventNames().includes(type as string)) {
        this.emit(type, message);
        continue;
      }
      if (this.pendingRead?.waitingFor === type) {
        this.pendingRead.resolver(message);
        this.pendingRead = undefined;
        continue;
      }
      throw new Error(`Unexpected message ${JSON.stringify(messageWrapper)}`);
    }
  }

  private handleStreamClose() {
    if (this.closed) return;
    this.closed = true;
    this.emit("closed");
  }

  private handleError(error: any) {
    this.handleStreamClose();
    if (error === ERROR.EOF) return;
    this.emit("error", error);
  }
}
