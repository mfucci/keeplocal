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
 * @param record Record o process
 * @param mapFunction Function converting the values
 * @returns new Record contained the mapped values
 */
export function recordMap<T, U>(record: Record<string, T>, mapFunction: (value: T) => U) {
    const result: Record<string, U> = {};
    for (var key in record) {
        result[key] = mapFunction(record[key]);
    }
    return result;
}
