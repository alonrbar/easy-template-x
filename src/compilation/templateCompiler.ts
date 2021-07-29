import { UnclosedTagError, UnknownContentTypeError, UnopenedTagError } from '../errors';
import { PluginContent, TemplatePlugin } from '../plugins';
import { IMap } from '../types';
import { isPromiseLike, stringValue, toDictionary } from '../utils';
import { XmlNode } from '../xml';
import { DelimiterSearcher } from './delimiterSearcher';
import { ScopeData } from './scopeData';
import { Tag, TagDisposition } from './tag';
import { TagParser } from './tagParser';
import { TemplateContext } from './templateContext';

export interface TemplateCompilerOptions {
    defaultContentType: string;
    containerContentType: string;
    skipEmptyTags?: boolean;
}

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
        private readonly options: TemplateCompilerOptions
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
            data.pathPush(tag);
            const contentType = this.detectContentType(tag, data);
            const plugin = this.pluginsLookup[contentType];
            if (!plugin) {
                throw new UnknownContentTypeError(
                    contentType,
                    tag.rawText,
                    data.pathString()
                );
            }

            if (tag.disposition === TagDisposition.SelfClosed) {
                await this.simpleTagReplacements(plugin, tag, data, context);

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

            data.pathPop();
        }
    }

    private detectContentType(tag: Tag, data: ScopeData): string {

        // explicit content type
        const scopeData = data.getScopeData();
        if (PluginContent.isPluginContent(scopeData))
            return scopeData._type;

        // implicit - loop
        if (tag.disposition === TagDisposition.Open || tag.disposition === TagDisposition.Close)
            return this.options.containerContentType;

        // implicit - text
        return this.options.defaultContentType;
    }

    private async simpleTagReplacements(plugin: TemplatePlugin, tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {
        if (this.options.skipEmptyTags && stringValue(data.getScopeData()) === '') {
            return;
        }

        const job = plugin.simpleTagReplacements(tag, data, context);
        if (isPromiseLike(job)) {
            await job;
        }
    }

    private findCloseTagIndex(fromIndex: number, openTag: Tag, tags: Tag[]): number {
        let openTags = 0;
        let i = fromIndex;
        for (; i < tags.length; i++) {
            const tag = tags[i];
            if (tag.disposition === TagDisposition.Open) {
                openTags++;
                continue;
            }
            if (tag.disposition == TagDisposition.Close) {
                openTags--;
                if (openTags === 0) {
                    return i;
                }
                if (openTags < 0) {
                    // As long as we don't change the input to
                    // this method (fromIndex in particular) this
                    // should never happen.
                    throw new UnopenedTagError(tag.name);
                }
                continue;
            }
        }

        if (i === tags.length) {
            throw new UnclosedTagError(openTag.name);
        }

        return i;
    }
}
