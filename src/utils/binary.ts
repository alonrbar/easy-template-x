import { Constructor } from '../types';
import { Base64 } from './base64';
import { inheritsFrom } from './types';

export type Binary = Blob | Buffer | ArrayBuffer;

export const Binary = {

    //
    // type detection
    //

    isBlob(binary: unknown): binary is Blob {
        return this.isBlobConstructor(binary.constructor as any);
    },

    isArrayBuffer(binary: unknown): binary is ArrayBuffer {
        return this.isArrayBufferConstructor(binary.constructor as any);
    },

    isBuffer(binary: unknown): binary is Buffer {
        return this.isBufferConstructor(binary.constructor as any);
    },

    isBlobConstructor(binaryType: Constructor<unknown>): binaryType is Constructor<Blob> {
        return (typeof Blob !== 'undefined' && inheritsFrom(binaryType, Blob));
    },

    isArrayBufferConstructor(binaryType: Constructor<unknown>): binaryType is Constructor<ArrayBuffer> {
        return (typeof ArrayBuffer !== 'undefined' && inheritsFrom(binaryType, ArrayBuffer));
    },

    isBufferConstructor(binaryType: Constructor<unknown>): binaryType is Constructor<Buffer> {
        return (typeof Buffer !== 'undefined' && inheritsFrom(binaryType, Buffer));
    },

    //
    // utilities
    //

    toBase64(binary: Binary): Promise<string> {

        if (this.isBlob(binary)) {
            return new Promise(resolve => {
                const fileReader = new FileReader();
                fileReader.onload = function () {
                    const base64 = Base64.encode(this.result as string);
                    resolve(base64);
                };
                fileReader.readAsBinaryString(binary);
            });
        }

        if (this.isBuffer(binary)) {
            return Promise.resolve(binary.toString('base64'));
        }

        if (this.isArrayBuffer(binary)) {
            // https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string#42334410
            const binaryStr = new Uint8Array(binary).reduce((str, byte) => str + String.fromCharCode(byte), '');
            const base64 = Base64.encode(binaryStr);
            return Promise.resolve(base64);
        }

        throw new Error(`Binary type '${(binary as any).constructor.name}' is not supported.`);
    }
};

