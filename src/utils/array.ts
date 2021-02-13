import { IMap } from '../types';

export type ItemMapper<TIn, TOut = string> = (item: TIn, index: number) => TOut;

export function pushMany<T>(destArray: T[], items: T[]): void {
    Array.prototype.push.apply(destArray, items);
}

export function first<T>(array: T[]): T {
    if (!array.length)
        return undefined;
    return array[0];
}

export function last<T>(array: T[]): T {
    if (!array.length)
        return undefined;
    return array[array.length - 1];
}

export function toDictionary<TIn, TOut = TIn>(array: TIn[], keySelector: ItemMapper<TIn>, valueSelector?: ItemMapper<TIn, TOut>): IMap<TOut> {
    if (!array.length)
        return {};

    const res: IMap<any> = {};
    array.forEach((item, index) => {
        const key = keySelector(item, index);
        const value = (valueSelector ? valueSelector(item, index) : item);
        if (res[key])
            throw new Error(`Key '${key}' already exists in the dictionary.`);
        res[key] = value;
    });
    return res;
}
