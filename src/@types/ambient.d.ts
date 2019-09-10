
interface IMap<T> {
    [key: string]: T;
}

interface Constructor<T> {
    new(...args: any[]): T;
}