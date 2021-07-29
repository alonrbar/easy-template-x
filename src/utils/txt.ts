export function stringValue(val: unknown) : string {
    if (val === null || val === undefined) {
        return '';
    }
    return val.toString();
}
