/**
 * Defines a constant for a sub-tree.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export function With<T>({
  value,
  children: render,
}: {
  value: T;
  children: (value: T) => any;
}) {
  return render(value);
}
