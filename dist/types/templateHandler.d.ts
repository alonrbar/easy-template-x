import { Tag } from './compilation';
import { ContentPartType } from './office';
import { TemplateData } from './templateData';
import { TemplateHandlerOptions } from './templateHandlerOptions';
import { Binary } from './utils';
import { XmlNode } from './xml';
export declare class TemplateHandler {
    readonly version: string;
    private readonly xmlParser;
    private readonly docxParser;
    private readonly compiler;
    private readonly options;
    constructor(options?: TemplateHandlerOptions);
    process<T extends Binary>(templateFile: T, data: TemplateData): Promise<T>;
    parseTags(templateFile: Binary, contentPart?: ContentPartType): Promise<Tag[]>;
    getText(docxFile: Binary, contentPart?: ContentPartType): Promise<string>;
    getXml(docxFile: Binary, contentPart?: ContentPartType): Promise<XmlNode>;
    private callExtensions;
    private loadDocx;
}
