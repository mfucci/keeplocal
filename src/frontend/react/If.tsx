/**
 * Conditional rendering of a subtree.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

export function If({
  condition,
  otherwise = null,
  children,
}: {
  condition: boolean;
  otherwise?: any;
  children: any;
}) {
  return condition ? children : otherwise;
}

export function IfDefined<T>({
  value,
  otherwise = null,
  children,
}: {
  value: T | undefined;
  otherwise?: any;
  children: (value: T) => any;
}) {
  return value !== undefined ? children(value) : otherwise;
}
