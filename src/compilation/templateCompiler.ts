import { UnclosedTagError } from '../errors';
import { LoopPlugin, SimpleTagPlugin, TemplatePlugin } from '../plugins';
import { XmlNode } from '../xmlNode';
import { DelimiterSearcher } from './delimiterSearcher';
import { Tag, TagDisposition } from './tag';
import { TagParser } from './tagParser';

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

    private readonly plugins: TemplatePlugin[] = [new LoopPlugin(), new SimpleTagPlugin()];
    private readonly delimiterSearcher = new DelimiterSearcher();
    private readonly tagParser = new TagParser();

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(node: XmlNode, data: any): void {
        const delimiters = this.delimiterSearcher.findDelimiters(node);
        const tags = this.tagParser.parse(delimiters);
        this.doTagReplacements(tags, data);
    }

    //
    // private methods
    //

    private doTagReplacements(tags: Tag[], data: any): void {

        this.plugins.forEach(plugin => plugin.setContext(this));

        for (let i = 0; i < tags.length; i++) {

            const tag = tags[i];
            const scopedData = (data ? data[tag.name] : undefined);

            if (tag.disposition === TagDisposition.SelfClosed) {

                // replace simple tag
                for (const plugin of this.plugins) {

                    if (plugin.tagType !== tag.type)
                        continue;

                    plugin.simpleTagReplacements(tag, scopedData);
                }

            } else if (tag.disposition === TagDisposition.Open) {

                // get all tags between the open and close tags
                const j = this.findCloseTagIndex(i, tag, tags);
                const scopeTags = tags.slice(i, j + 1);
                i = i + j;

                // replace container tag
                for (const plugin of this.plugins) {

                    if (plugin.tagType !== tag.type)
                        continue;

                    plugin.containerTagReplacements(scopeTags, scopedData);
                }
            }
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