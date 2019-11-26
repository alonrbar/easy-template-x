/**
 * Version number of the `easy-template-x` library.
 */
export const EASY_VERSION: string = null; // eslint-disable-line

export interface IMap<T> {
    [key: string]: T;
}

export interface Constructor<T> {
    new (...args: any[]): T;
}
