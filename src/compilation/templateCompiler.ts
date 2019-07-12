import { UnclosedTagError } from '../errors';
import { TemplatePlugin } from '../plugins';
import { toDictionary } from '../utils/array';
import { IMap } from '../utils/types';
import { XmlNode } from '../xmlNode';
import { DelimiterSearcher } from './delimiterSearcher';
import { ScopeData } from './scopeData';
import { Tag, TagDisposition } from './tag';
import { TagParser } from './tagParser';
import { TemplateContext } from './templateContext';

/**
 * The TemplateCompiler works roughly the same way as a source code compiler.
 * It's main steps are:
 * 
 * 1. find delimiters (lexical analysis) :: (Document) => DelimiterMark[]
 * 2. extract tags (syntax analysis) :: (DelimiterMark[]) => Tag[]
 * 3. perform document replace (code generation) :: (Tag[], data) => Document*
 * 
 * see: https://en.wikipedia.org/wiki/Compiler
 */
export class TemplateCompiler {

    private readonly pluginsLookup: IMap<TemplatePlugin>;

    constructor(
        private readonly delimiterSearcher: DelimiterSearcher,
        private readonly tagParser: TagParser,
        plugins: TemplatePlugin[],
        private readonly defaultTagType: string,
        private readonly containerTagType: string
    ) {
        this.pluginsLookup = toDictionary(plugins, p => p.tagType);
    }

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(node: XmlNode, data: ScopeData, context: TemplateContext): void {
        const tags = this.parseTags(node);
        this.doTagReplacements(tags, data, context);
    }

    public parseTags(node: XmlNode): Tag[] {
        const delimiters = this.delimiterSearcher.findDelimiters(node);
        const tags = this.tagParser.parse(delimiters);
        return tags;
    }

    //
    // private methods
    //

    private doTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {

        for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {

            const tag = tags[tagIndex];
            data.path.push(tag.name);
            const tagType = this.detectTagType(tag, data);
            const plugin = this.pluginsLookup[tagType];

            // no plugin matches the given tag type - skip processing it
            if (!plugin)
                continue;

            if (tag.disposition === TagDisposition.SelfClosed) {

                // replace simple tag                
                plugin.simpleTagReplacements(tag, data, context);

            } else if (tag.disposition === TagDisposition.Open) {

                // get all tags between the open and close tags
                const closingTagIndex = this.findCloseTagIndex(tagIndex, tag, tags);
                const scopeTags = tags.slice(tagIndex, closingTagIndex + 1);
                tagIndex = closingTagIndex;

                // replace container tag
                plugin.containerTagReplacements(scopeTags, data, context);
            }

            data.path.pop();
        }
    }

    private detectTagType(tag: Tag, data: ScopeData): string {

        if (tag.disposition === TagDisposition.Open || tag.disposition === TagDisposition.Close)
            return this.containerTagType;

        const scopeData = data.getScopeData();
        if (scopeData && typeof scopeData._type === 'string')
            return scopeData._type;

        return this.defaultTagType;
    }

    private findCloseTagIndex(fromIndex: number, openTag: Tag, tags: Tag[]): number {

        let i = fromIndex;
        for (; i < tags.length; i++) {
            const closeTag = tags[i];
            if (
                closeTag.name === openTag.name &&
                closeTag.disposition === TagDisposition.Close
            ) {
                break;
            }
        }

        if (i === tags.length) {
            throw new UnclosedTagError(openTag.name);
        }

        return i;
    }
}