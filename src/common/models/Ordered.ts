export interface Ordered {
    order: number,
}

export function sortByOrder<T extends Ordered>(a: T, b: T) {
    return a.order - b.order;
}