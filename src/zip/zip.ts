import JSZip from 'jszip';
import { Constructor } from '../types';
import { Binary } from '../utils';
import { JsZipHelper } from './jsZipHelper';
import { ZipObject } from './zipObject';

export class Zip {

    public static async load(file: Binary): Promise<Zip> {
        const zip = await JSZip.loadAsync(file);
        return new Zip(zip, file.constructor as Constructor<Binary>);
    }

    private readonly zip: JSZip;
    private readonly binaryFormat: Constructor<Binary>;
    private constructor(zip: JSZip, binaryFormat: Constructor<Binary>) {
        this.zip = zip;
        this.binaryFormat = binaryFormat;
    }

    public getFile(path: string): ZipObject {
        const internalZipObject = this.zip.files[path];
        if (!internalZipObject)
            return null;
        return new ZipObject(internalZipObject, this.binaryFormat);
    }

    public setFile(path: string, content: string | Binary): void {
        this.zip.file(path, content);
    }

    public isFileExist(path: string): boolean {
        return !!this.zip.files[path];
    }

    public listFiles(): string[] {
        return Object.keys(this.zip.files);
    }

    public async export<T extends Binary>(outputType?: Constructor<T>): Promise<T> {
        const zipOutputType: JSZip.OutputType = JsZipHelper.toJsZipOutputType(outputType ?? this.binaryFormat);
        const output = await this.zip.generateAsync({
            type: zipOutputType,
            compression: "DEFLATE",
            compressionOptions: {
                level: 6 // between 1 (best speed) and 9 (best compression)
            }
        });
        return output as T;
    }
}
