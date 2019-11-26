import { DocxParser } from '../office';
import { XmlNode } from '../xml';
import { DelimiterMark } from './delimiterMark';
export declare class DelimiterSearcher {
    private readonly docxParser;
    maxXmlDepth: number;
    startDelimiter: string;
    endDelimiter: string;
    constructor(docxParser: DocxParser);
    findDelimiters(node: XmlNode): DelimiterMark[];
    private shouldSearchNode;
    private findNextNode;
    private createDelimiterMark;
}
