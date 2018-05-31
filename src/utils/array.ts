export function pushMany<T>(destArray: T[], items: T[]): void {
    Array.prototype.push.apply(destArray, items);
}