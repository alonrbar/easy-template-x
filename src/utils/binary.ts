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

    //
    // HACK: Fixes https://github.com/alonrbar/easy-template-x/issues/5  
    //
    // The issue happens due to some library on the way (maybe babel?)
    // replacing Node's Buffer with this implementation:
    // https://www.npmjs.com/package/buffer  
    // The custom implementation actually uses an Uint8Array and therefor
    // fails all the above `if` clauses.
    //
    // I'm assuming we'll be able to remove this if we create an esnext, non-compiled
    // version with rollup or something of that sort.
    //
    if (typeof Uint8Array !== 'undefined' && inheritsFrom(binaryType, Uint8Array))
        return 'nodebuffer';

    throw new Error(`Binary type '${binaryType.name}' is not supported.`);
};