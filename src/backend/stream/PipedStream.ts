/**
 * Creates two streams piped to each other.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Queue } from "./Queue";
import { ERROR, Stream } from "./Stream";

export class QueueStream<READ_T, WRITE_T = READ_T> extends Stream<
  READ_T,
  WRITE_T
> {
  constructor(
    private readonly readQueue: Queue<READ_T>,
    private readonly writeQueue: Queue<WRITE_T>
  ) {
    super();
  }

  async write(message: WRITE_T) {
    this.writeQueue.write(message);
  }

  async read() {
    try {
      return await this.readQueue.read();
    } catch (reason) {
      if (reason === ERROR.EOF) this.close();
      throw reason;
    }
  }

  async close() {
    this.emit("closed");
    this.readQueue.close();
    this.writeQueue.close();
  }
}

export function getPipedStreams<T1, T2 = T1>() {
  const queue1 = new Queue<T1>();
  const queue2 = new Queue<T2>();

  const stream12 = new QueueStream(queue1, queue2);
  const stream21 = new QueueStream(queue2, queue1);
  return [stream12, stream21];
}
