import * as JSZip from 'jszip';
import { MissingArgumentError } from '../errors';

export type Binary = Blob | Buffer | ArrayBuffer;

// tslint:disable-next-line:no-namespace
export namespace Binary {

    export function toJsZipOutputType(binary: Binary): JSZip.OutputType {
        if (!binary)
            throw new MissingArgumentError(nameof(binary));

        if (typeof Blob !== 'undefined' && binary instanceof Blob)
            return 'blob';
        if (typeof ArrayBuffer !== 'undefined' && binary instanceof ArrayBuffer)
            return 'arraybuffer';
        if (typeof Buffer !== 'undefined' && binary instanceof Buffer)
            return 'nodebuffer';

        throw new Error(`Binary type '${(binary as any).constructor.name}' is not supported.`);

    }
}