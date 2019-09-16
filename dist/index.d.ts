import { Delimiters } from './compliation';
import { Binary } from './misc';
import { ImageContent, RawXmlContent, TemplatePlugin } from './plugins';
import { Tag } from './tag';
import { XmlNode } from './xml';

export class TemplateHandler {

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

export type TemplateContent = string | number | boolean | ImageContent | RawXmlContent;

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