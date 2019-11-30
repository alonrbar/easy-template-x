import * as JSZip from 'jszip';
import { Constructor } from '../types';
import { Binary } from '../utils';
export declare class ZipObject {
    private readonly zipObject;
    name: string;
    readonly isDirectory: boolean;
    constructor(zipObject: JSZip.JSZipObject);
    getContentText(): Promise<string>;
    getContentBase64(): Promise<string>;
    getContentBinary<T extends Binary>(outputType: Constructor<T>): Promise<T>;
}
