
export type IMap<T> = Record<string, T>;

export interface Constructor<T> {
    new(...args: any[]): T;
}
