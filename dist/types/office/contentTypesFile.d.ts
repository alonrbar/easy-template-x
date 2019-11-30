import { MimeType } from '../mimeType';
import { XmlParser } from '../xml';
import { Zip } from '../zip';
export declare class ContentTypesFile {
    private readonly zip;
    private readonly xmlParser;
    private static readonly contentTypesFilePath;
    private addedNew;
    private root;
    private contentTypes;
    constructor(zip: Zip, xmlParser: XmlParser);
    ensureContentType(mime: MimeType): Promise<void>;
    count(): Promise<number>;
    save(): Promise<void>;
    private parseContentTypesFile;
}
