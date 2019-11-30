/// <reference types="node" />
import { Constructor } from '../types';
export declare type Binary = Blob | Buffer | ArrayBuffer;
export declare const Binary: {
    isBlob(binary: any): binary is Blob;
    isArrayBuffer(binary: any): binary is ArrayBuffer;
    isBuffer(binary: any): binary is Buffer;
    isBlobConstructor(binaryType: Constructor<any>): binaryType is Constructor<Blob>;
    isArrayBufferConstructor(binaryType: Constructor<any>): binaryType is Constructor<ArrayBuffer>;
    isBufferConstructor(binaryType: Constructor<any>): binaryType is Constructor<Buffer>;
    toBase64(binary: Binary): Promise<string>;
};
