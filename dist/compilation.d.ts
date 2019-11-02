import { Delimiters, TemplateContent, TemplateData } from './index';
import { Docx, DocxParser } from './office';
import { TemplatePlugin } from './plugins';
import { Tag } from './tag';
import { XmlNode, XmlTextNode } from './xml';

export class TemplateCompiler {

    constructor(
        delimiterSearcher: DelimiterSearcher,
        tagParser: TagParser,
        plugins: TemplatePlugin[],
        defaultContentType: string,
        containerContentType: string
    );

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    compile(node: XmlNode, data: ScopeData, context: TemplateContext): Promise<void>;

    parseTags(node: XmlNode): Tag[];
}

export class DelimiterMark {

    xmlTextNode: XmlTextNode;

    /**
     * Index inside the text node
     */
    index: number;

    /**
     * Is this an open delimiter or a close delimiter
     */
    isOpen: boolean;

    constructor(initial?: Partial<DelimiterMark>);
}

export class DelimiterSearcher {

    maxXmlDepth: number;
    startDelimiter: string;
    endDelimiter: string;

    findDelimiters(node: XmlNode): DelimiterMark[];
}

export class TagParser {

    constructor(docParser: DocxParser, delimiters: Delimiters);

    parse(delimiters: DelimiterMark[]): Tag[];
}

export class ScopeData {

    readonly path: (string | number)[];
    readonly allData: TemplateData;

    constructor(data: TemplateData);

    getScopeData(): TemplateContent | TemplateData[];
}

export interface TemplateContext {

    docx: Docx;
}