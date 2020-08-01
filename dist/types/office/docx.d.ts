import { Constructor } from '../types';
import { Binary } from '../utils';
import { XmlParser } from '../xml';
import { Zip } from '../zip';
import { ContentPartType } from './contentPartType';
import { ContentTypesFile } from './contentTypesFile';
import { MediaFiles } from './mediaFiles';
import { XmlPart } from './xmlPart';
export declare class Docx {
    private readonly zip;
    private readonly xmlParser;
    private static readonly mainDocumentRelType;
    static open(zip: Zip, xmlParser: XmlParser): Promise<Docx>;
    private static getMainDocumentPath;
    readonly mainDocument: XmlPart;
    readonly mediaFiles: MediaFiles;
    readonly contentTypes: ContentTypesFile;
    private readonly _parts;
    get rawZipFile(): Zip;
    private constructor();
    getContentPart(type: ContentPartType): Promise<XmlPart>;
    getContentParts(): Promise<XmlPart[]>;
    export<T extends Binary>(outputType: Constructor<T>): Promise<T>;
    private getHeaderOrFooter;
    private headerFooterNodeName;
    private headerFooterType;
    private saveChanges;
}
