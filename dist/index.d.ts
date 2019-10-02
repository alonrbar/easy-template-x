import { Delimiters } from './compliation';
import { Binary } from './misc';
import { Tag } from './tag';
import { XmlNode } from './xml';
import { ImageContent, RawXmlContent, TemplatePlugin , LinkContent} from './plugins';

export class TemplateHandler {

    /**
     * Version number of the `easy-template-x` library.
     */
    readonly version: string;

    constructor(options?: TemplateHandlerOptions);

    process<T extends Binary>(templateFile: T, data: any): Promise<T>;

    parseTags(templateFile: Binary): Promise<Tag[]>;

    /**
     * Get the text content of the main document file.
     */
    getText(docxFile: Binary): Promise<string>;

    /**
     * Get the xml tree of the main document file.
     */
    getXml(docxFile: Binary): Promise<XmlNode>;
}

export type PrimitiveTemplateContent = string | number | boolean;

export type PluginTemplateContent = ImageContent | RawXmlContent | LinkContent;

export type TemplateContent = PrimitiveTemplateContent | PluginTemplateContent;

export interface TemplateData {
    [tagName: string]: TemplateContent | TemplateData | TemplateData[];
}

export class TemplateHandlerOptions {

    plugins?: TemplatePlugin[];

    defaultContentType = TEXT_CONTENT_TYPE;

    containerContentType = LOOP_CONTENT_TYPE;

    delimiters?: Delimiters;

    maxXmlDepth?= 20;

    constructor(initial?: Partial<TemplateHandlerOptions>);
}

export class Delimiters {

    start: string;

    end: string;

    constructor(initial?: Delimiters);
}

// re-export

export * from './compilation';
export * from './errors';
export * from './misc';
export * from './office';
export * from './plugins';
export * from './tag';
export * from './xml';
export * from './zip';