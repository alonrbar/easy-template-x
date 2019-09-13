import * as JSZip from 'jszip';
import { MissingArgumentError } from '../errors';
import { Binary } from '../utils';

export class JsZipHelper {

    public static toJsZipOutputType(binary: Binary): JSZip.OutputType;
    public static toJsZipOutputType(binaryType: Constructor<Binary>): JSZip.OutputType;
    public static toJsZipOutputType(binaryOrType: Binary | Constructor<Binary>): JSZip.OutputType {

        if (!binaryOrType)
            throw new MissingArgumentError(nameof(binaryOrType));

        let binaryType: Constructor<Binary>;
        if (typeof binaryOrType === 'function') {
            binaryType = binaryOrType as Constructor<Binary>;
        } else {
            binaryType = binaryOrType.constructor as Constructor<Binary>;
        }

        if (Binary.isBlobConstructor(binaryType))
            return 'blob';
        if (Binary.isArrayBufferConstructor(binaryType))
            return 'arraybuffer';
        if (Binary.isBufferConstructor(binaryType))
            return 'nodebuffer';

        throw new Error(`Binary type '${binaryType.name}' is not supported.`);
    };
}