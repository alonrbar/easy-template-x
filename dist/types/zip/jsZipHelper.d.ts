import * as JSZip from 'jszip';
import { Constructor } from '../types';
import { Binary } from '../utils';
export declare class JsZipHelper {
    static toJsZipOutputType(binary: Binary): JSZip.OutputType;
    static toJsZipOutputType(binaryType: Constructor<Binary>): JSZip.OutputType;
}
