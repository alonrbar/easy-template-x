import { UnclosedTagError } from '../errors';
import { TemplatePlugin } from '../plugins';
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

    constructor(
        private readonly delimiterSearcher: DelimiterSearcher,
        private readonly tagParser: TagParser,
        private readonly plugins: TemplatePlugin[]) {
    }

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(node: XmlNode, data: ScopeData, context: TemplateContext): void {
        const delimiters = this.delimiterSearcher.findDelimiters(node);
        const tags = this.tagParser.parse(delimiters);
        this.doTagReplacements(tags, data, context);
    }

    //
    // private methods
    //

    private doTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {

        for (let i = 0; i < tags.length; i++) {

            const tag = tags[i];
            data.path.push(tag.name);

            if (tag.disposition === TagDisposition.SelfClosed) {

                // replace simple tag
                for (const plugin of this.plugins) {
                    if (plugin.prefixes.some(prefix => prefix.tagType === tag.type)) {
                        plugin.simpleTagReplacements(tag, data, context);
                        break;
                    }
                }

            } else if (tag.disposition === TagDisposition.Open) {

                // get all tags between the open and close tags
                const j = this.findCloseTagIndex(i, tag, tags);
                const scopeTags = tags.slice(i, j + 1);
                i = j;

                // replace container tag
                for (const plugin of this.plugins) {
                    if (plugin.prefixes.some(prefix => prefix.tagType === tag.type)) {
                        plugin.containerTagReplacements(scopeTags, data, context);
                        break;
                    }
                }
            }

            data.path.pop();
        }
    }

    private findCloseTagIndex(fromIndex: number, openTag: Tag, tags: Tag[]): number {

        let i = fromIndex;
        for (; i < tags.length; i++) {
            const closeTag = tags[i];
            if (
                closeTag.name === openTag.name &&
                closeTag.type === openTag.type &&
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