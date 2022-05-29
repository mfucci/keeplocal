/**
 * Define common fields for ordered elements.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ordered {
  order: number;
}

export function sortByOrder<T extends Ordered>(a: T, b: T) {
  return a.order - b.order;
}
