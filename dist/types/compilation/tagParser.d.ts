import { Delimiters } from '../delimiters';
import { DocxParser } from '../office';
import { DelimiterMark } from './delimiterMark';
import { Tag } from './tag';
export declare class TagParser {
    private readonly docParser;
    private readonly delimiters;
    private readonly tagRegex;
    constructor(docParser: DocxParser, delimiters: Delimiters);
    parse(delimiters: DelimiterMark[]): Tag[];
    private normalizeTagNodes;
    private processTag;
}
