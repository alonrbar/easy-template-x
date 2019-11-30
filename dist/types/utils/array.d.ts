import { IMap } from '../types';
export declare type ItemMapper<TIn, TOut = string> = (item: TIn, index: number) => TOut;
export declare function pushMany<T>(destArray: T[], items: T[]): void;
export declare function first<T>(array: T[]): T;
export declare function last<T>(array: T[]): T;
export declare function toDictionary<TIn, TOut = TIn>(array: TIn[], keySelector: ItemMapper<TIn>, valueSelector?: ItemMapper<TIn, TOut>): IMap<TOut>;
