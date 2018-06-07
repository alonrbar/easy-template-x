export function pushMany<T>(destArray: T[], items: T[]): void {
    Array.prototype.push.apply(destArray, items);
}

export function last<T>(array: T[]): T {
    if (!array.length)
        return undefined;
    return array[array.length - 1];
}