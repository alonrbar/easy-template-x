export type Binary = Blob | Buffer | ArrayBuffer;

export enum MimeType {
    Png = 'image/png',
    Jpeg = 'image/jpeg',
    Gif = 'image/gif',
    Bmp = 'image/bmp',
    Svg = 'image/svg+xml'
}

export interface IMap<T> {
    [key: string]: T;
}

export interface Constructor<T> {
    new(...args: any[]): T;
}