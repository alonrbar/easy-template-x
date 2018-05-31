import * as JSZip from 'jszip';
import { MissingArgumentError } from '../errors';

export type Binary = Blob | Buffer | ArrayBuffer;

// tslint:disable-next-line:no-namespace
export namespace Binary {

    export function toJsZipOutputType(binary: Binary): JSZip.OutputType {
        if (!binary)
            throw new MissingArgumentError(nameof(binary));

        const type = binary.constructor.name.toLowerCase();
        switch (type) {
            case 'blob':
                return type;
            case 'arraybuffer':
                return type;
            case 'buffer':
                return 'nodebuffer';
            default:
                throw new Error(`Binary type '${type}' is not supported.`);

        }
    }
}