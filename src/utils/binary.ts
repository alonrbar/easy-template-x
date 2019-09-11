import * as JSZip from 'jszip';
import { MissingArgumentError } from '../errors';

export type Binary = Blob | Buffer | ArrayBuffer;

export const Binary = {

    toJsZipOutputType(binary: Binary): JSZip.OutputType {
        if (!binary)
            throw new MissingArgumentError(nameof(binary));

        if (typeof Blob !== 'undefined' && binary instanceof Blob)
            return 'blob';
        if (typeof ArrayBuffer !== 'undefined' && binary instanceof ArrayBuffer)
            return 'arraybuffer';
        if (typeof Buffer !== 'undefined' && binary instanceof Buffer)
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
        if (typeof Uint8Array !== 'undefined' && binary instanceof Uint8Array)
            return 'nodebuffer';

        throw new Error(`Binary type '${(binary as any).constructor.name}' is not supported.`);
    }
};