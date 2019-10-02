
/**
 * Version number of the `easy-template-x` library.
 */
const EASY_VERSION: string; // eslint-disable-line

interface IMap<T> {
    [key: string]: T;
}

interface Constructor<T> {
    new(...args: any[]): T;
}