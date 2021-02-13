export function isNumber(value : unknown) : value is number {
    return Number.isFinite(value);
}
