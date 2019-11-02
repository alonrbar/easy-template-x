import { Binary, Constructor } from './misc';

export class Zip {

    static load(file: Binary): Promise<Zip>;

    getFile(path: string): ZipObject;

    setFile(path: string, content: string | Binary): void;

    isFileExist(path: string): boolean;

    listFiles(): string[];

    export<T extends Binary>(outputType: Constructor<T>): Promise<T>;
}

export class ZipObject {

    name: string;

    readonly isDirectory: boolean;

    getContentText(): Promise<string>;

    getContentBase64(): Promise<string>;

    getContentBinary<T extends Binary>(outputType: Constructor<T>): Promise<T>;
}