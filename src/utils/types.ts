import { Constructor } from '../types';

export function inheritsFrom(derived: Constructor<any>, base: Constructor<any>): boolean {
    // https://stackoverflow.com/questions/14486110/how-to-check-if-a-javascript-class-inherits-another-without-creating-an-obj
    return derived === base || derived.prototype instanceof base;
}

export function isPromiseLike<T>(candidate: unknown): candidate is PromiseLike<T> {
    return !!candidate && typeof candidate === 'object' && typeof (candidate as any).then === 'function';
}
