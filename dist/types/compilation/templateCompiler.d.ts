import { TemplatePlugin } from '../plugins';
import { XmlNode } from '../xml';
import { DelimiterSearcher } from './delimiterSearcher';
import { ScopeData } from './scopeData';
import { Tag } from './tag';
import { TagParser } from './tagParser';
import { TemplateContext } from './templateContext';
export declare class TemplateCompiler {
    private readonly delimiterSearcher;
    private readonly tagParser;
    private readonly defaultContentType;
    private readonly containerContentType;
    private readonly pluginsLookup;
    constructor(delimiterSearcher: DelimiterSearcher, tagParser: TagParser, plugins: TemplatePlugin[], defaultContentType: string, containerContentType: string);
    compile(node: XmlNode, data: ScopeData, context: TemplateContext): Promise<void>;
    parseTags(node: XmlNode): Tag[];
    private doTagReplacements;
    private detectContentType;
    private findCloseTagIndex;
}
