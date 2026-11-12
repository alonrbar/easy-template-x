
export interface Constructor<T> {
    new(...args: any[]): T;
}

export type ValueOf<T> = T[keyof T];
