import * as JSZip from 'jszip';
import { MissingArgumentError } from '../errors';
import { Base64 } from './base64';
import { inheritsFrom } from './types';

export type Binary = Blob | Buffer | ArrayBuffer;

export const Binary = {

    toJsZipOutputType,

    toBase64(binary: Binary): Promise<string> {

        if (isBlob(binary)) {
            return new Promise(resolve => {
                const fileReader = new FileReader();
                fileReader.onload = function () {
                    const base64 = Base64.encode(this.result as string);
                    resolve(base64);
                };
                fileReader.readAsBinaryString(binary);
            });
        }

        if (isBuffer(binary)) {
            return Promise.resolve(binary.toString('base64'));
        }

        if (isArrayBuffer(binary)) {
            // https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#42334410
            const binaryStr = new Uint8Array(binary).reduce((str, byte) => str + String.fromCharCode(byte), '');
            const base64 = Base64.encode(binaryStr);
            return Promise.resolve(base64);
        }

        throw new Error(`Binary type '${(binary as any).constructor.name}' is not supported.`);
    }
};

function toJsZipOutputType(binary: Binary): JSZip.OutputType;
function toJsZipOutputType(binaryType: Constructor<Binary>): JSZip.OutputType;
function toJsZipOutputType(binaryOrType: Binary | Constructor<Binary>): JSZip.OutputType {

    if (!binaryOrType)
        throw new MissingArgumentError(nameof(binaryOrType));

    let binaryType: Constructor<Binary>;
    if (typeof binaryOrType === 'function') {
        binaryType = binaryOrType as Constructor<Binary>;
    } else {
        binaryType = binaryOrType.constructor as Constructor<Binary>;
    }

    if (isBlobConstructor(binaryType))
        return 'blob';
    if (isArrayBufferConstructor(binaryType))
        return 'arraybuffer';
    if (isBufferConstructor(binaryType))
        return 'nodebuffer';

    throw new Error(`Binary type '${binaryType.name}' is not supported.`);
};

//
// type detection
//

function isBlob(binary: any): binary is Blob {
    return isBlobConstructor(binary.constructor);
}

function isArrayBuffer(binary: any): binary is ArrayBuffer {
    return isArrayBufferConstructor(binary.constructor);
}

function isBuffer(binary: any): binary is Buffer {
    return isBufferConstructor(binary.constructor);
}

function isBlobConstructor(binaryType: Constructor<any>): binaryType is Constructor<Blob> {
    return (typeof Blob !== 'undefined' && inheritsFrom(binaryType, Blob));
}

function isArrayBufferConstructor(binaryType: Constructor<any>): binaryType is Constructor<ArrayBuffer> {
    return (typeof ArrayBuffer !== 'undefined' && inheritsFrom(binaryType, ArrayBuffer));
}

function isBufferConstructor(binaryType: Constructor<any>): binaryType is Constructor<Buffer> {
    return (typeof Buffer !== 'undefined' && inheritsFrom(binaryType, Buffer));
}