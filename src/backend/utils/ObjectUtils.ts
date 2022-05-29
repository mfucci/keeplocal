/**
 * Utils for handling objects.
 *
 * @license
 * Copyright 2022 Marco Fucci di Napoli (mfucci@gmail.com)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Maps a function on a Record object, similar to Array.map.
 *
 * @param record Record to process
 * @param mapFunction Function converting the values
 * @returns new Record contained the mapped values
 */
export function recordMap<T, U>(
  record: Record<string, T>,
  mapFunction: (value: T) => U
) {
  const result: Record<string, U> = {};
  for (var key in record) {
    result[key] = mapFunction(record[key]);
  }
  return result;
}

/**
 * Returns a deep copy of an object.
 *
 * @param object Object to copy
 * @returns deep copy of the object
 */
export function deepCopy(object: any) {
  if (object === null) {
    return null;
  }
  if (object instanceof Date) {
    return new Date(object.getTime());
  }
  if (object instanceof Array) {
    const result = [] as any[];
    object.forEach((element) => result.push(deepCopy(element)));
    return result;
  }
  if (typeof object === "object" && object !== {}) {
    const result = { ...object };
    Object.keys(result).forEach((key) => {
      result[key] = deepCopy(result[key]);
    });
    return result;
  }
  return object;
}

/**
 * Returns the difference between two objects
 *
 * @param object Object to copy
 * @returns deep copy of the object
 */
export function diff(oldObject: any, newObject: any) {
  if (oldObject === newObject) {
    return undefined;
  }
  if (oldObject === null || oldObject === undefined) {
    return newObject;
  }
  if (newObject === undefined) {
    return undefined;
  }
  if (oldObject instanceof Date && newObject instanceof Date) {
    if (oldObject.getTime() !== newObject.getTime()) {
      return newObject;
    }
    return undefined;
  }
  if (oldObject instanceof Array && newObject instanceof Array) {
    throw new Error("Arrays are not supported");
  }
  if (typeof oldObject === "object" && typeof newObject === "object") {
    const result: any = {};
    const oldKeys = Object.keys(oldObject);
    const newKeys = Object.keys(newObject);
    oldKeys.forEach((key) => {
      const diffObject = diff(oldObject[key], newObject[key]);
      if (diffObject !== undefined) result[key] = diffObject;
    });
    oldKeys
      .filter((key) => !newKeys.includes(key))
      .forEach((key) => (result[key] = undefined));
    newKeys
      .filter((key) => !oldKeys.includes(key))
      .forEach((key) => (result[key] = newObject[key]));
    return result;
  }
  return newObject;
}
