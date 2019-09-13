import { UnclosedTagError, UnknownContentTypeError } from '../errors';
import { PluginContent, TemplatePlugin } from '../plugins';
import { isPromiseLike, toDictionary } from '../utils';
import { XmlNode } from '../xml';
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
        private readonly defaultContentType: string,
        private readonly containerContentType: string
    ) {
        this.pluginsLookup = toDictionary(plugins, p => p.contentType);
    }

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public async compile(node: XmlNode, data: ScopeData, context: TemplateContext): Promise<void> {
        const tags = this.parseTags(node);
        await this.doTagReplacements(tags, data, context);
    }

    public parseTags(node: XmlNode): Tag[] {
        const delimiters = this.delimiterSearcher.findDelimiters(node);
        const tags = this.tagParser.parse(delimiters);
        return tags;
    }

    //
    // private methods
    //

    private async doTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): Promise<void> {

        for (let tagIndex = 0; tagIndex < tags.length; tagIndex++) {

            const tag = tags[tagIndex];
            data.path.push(tag.name);
            const contentType = this.detectContentType(tag, data);
            const plugin = this.pluginsLookup[contentType];
            if (!plugin) {
                throw new UnknownContentTypeError(
                    contentType,
                    tag.rawText,
                    data.path.join('.')
                );
            }

            if (tag.disposition === TagDisposition.SelfClosed) {

                // replace simple tag                
                const job = plugin.simpleTagReplacements(tag, data, context);
                if (isPromiseLike(job)) {
                    await job;
                }

            } else if (tag.disposition === TagDisposition.Open) {

                // get all tags between the open and close tags
                const closingTagIndex = this.findCloseTagIndex(tagIndex, tag, tags);
                const scopeTags = tags.slice(tagIndex, closingTagIndex + 1);
                tagIndex = closingTagIndex;

                // replace container tag
                const job = plugin.containerTagReplacements(scopeTags, data, context);
                if (isPromiseLike(job)) {
                    await job;
                }
            }

            data.path.pop();
        }
    }

    private detectContentType(tag: Tag, data: ScopeData): string {

        if (tag.disposition === TagDisposition.Open || tag.disposition === TagDisposition.Close)
            return this.containerContentType;

        const scopeData = data.getScopeData();
        if (PluginContent.isPluginContent(scopeData))
            return scopeData._type;

        return this.defaultContentType;
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