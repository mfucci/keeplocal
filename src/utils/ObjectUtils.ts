export function recordMap<T, U>(object: Record<string, T>, mapFunction: (value: T) => U) {
    const result: Record<string, U> = {};
    for (var key in object) {
        result[key] = mapFunction(object[key]);
    }
    return result;
}
