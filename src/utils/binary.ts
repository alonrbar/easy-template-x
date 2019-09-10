import * as JSZip from 'jszip';
import { MissingArgumentError } from '../errors';
import { inheritsFrom } from './types';

export type Binary = Blob | Buffer | ArrayBuffer;

export const Binary = {
    toJsZipOutputType
};

function toJsZipOutputType(binary: Binary): JSZip.OutputType;
function toJsZipOutputType(binaryType: Constructor<Binary>): JSZip.OutputType;
function toJsZipOutputType(binaryOrType: Binary | Constructor<Binary>): JSZip.OutputType {
    
    if (!binaryOrType)
        throw new MissingArgumentError(nameof(binaryOrType));

    let binaryType: Constructor<Binary>;
    if (typeof binaryOrType === 'function') {
        binaryType = binaryOrType as any;
    } else {
        binaryType = binaryOrType.constructor as any;
    }

    if (typeof Blob !== 'undefined' && inheritsFrom(binaryType, Blob))
        return 'blob';
    if (typeof ArrayBuffer !== 'undefined' && inheritsFrom(binaryType, ArrayBuffer))
        return 'arraybuffer';
    if (typeof Buffer !== 'undefined' && inheritsFrom(binaryType, Buffer))
        return 'nodebuffer';

    throw new Error(`Binary type '${binaryType.name}' is not supported.`);
};