import { Constructor } from "./misc";
export declare function inheritsFrom(derived: Constructor<any>, base: Constructor<any>): boolean;
export declare function isPromiseLike<T>(candidate: any): candidate is PromiseLike<T>;
