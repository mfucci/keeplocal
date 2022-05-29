/**
 * Renders each array items.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export function Iterate<T>({
  array,
  children: render,
}: {
  array: T[];
  children: (value: T, index: number) => any;
}) {
  return (
    <React.Fragment>
      {array.map((value, index) => render(value, index))}
    </React.Fragment>
  );
}

export function IterateObject<K extends string, V>({
  object,
  children: render,
}: {
  object: { [key in K]?: V };
  children: (key: K, value: V, index: number) => any;
}) {
  return (
    <React.Fragment>
      {(Object.entries(object) as [K, V][]).map(([key, value], index) =>
        render(key, value, index)
      )}
    </React.Fragment>
  );
}
