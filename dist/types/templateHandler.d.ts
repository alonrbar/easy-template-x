import { Tag } from './compilation';
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
    process<T extends Binary>(templateFile: T, data: any): Promise<T>;
    parseTags(templateFile: Binary): Promise<Tag[]>;
    getText(docxFile: Binary): Promise<string>;
    getXml(docxFile: Binary): Promise<XmlNode>;
    private loadDocx;
}
