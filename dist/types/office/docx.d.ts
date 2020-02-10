import { Constructor } from '../types';
import { Binary } from '../utils';
import { XmlNode, XmlParser } from '../xml';
import { Zip } from '../zip';
import { ContentTypesFile } from './contentTypesFile';
import { MediaFiles } from './mediaFiles';
import { Rels } from './rels';
export declare class Docx {
    private readonly zip;
    private readonly xmlParser;
    get documentPath(): string;
    readonly rels: Rels;
    readonly mediaFiles: MediaFiles;
    readonly contentTypes: ContentTypesFile;
    private _documentPath;
    private _document;
    constructor(zip: Zip, xmlParser: XmlParser);
    getDocument(): Promise<XmlNode>;
    getDocumentText(): Promise<string>;
    export<T extends Binary>(outputType: Constructor<T>): Promise<T>;
    private saveChanges;
}
