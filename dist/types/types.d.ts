export interface IMap<T> {
    [key: string]: T;
}
export interface Constructor<T> {
    new (...args: any[]): T;
}
