
export interface IMap<T> {
    [key: string]: T;
}

export interface Constructor<T> {
    new(...args: any[]): T;
}

export function inheritsFrom(derived: Constructor<any>, base: Constructor<any>): boolean {
    // https://stackoverflow.com/questions/14486110/how-to-check-if-a-javascript-class-inherits-another-without-creating-an-obj
    return derived === base || derived.prototype instanceof base;
}