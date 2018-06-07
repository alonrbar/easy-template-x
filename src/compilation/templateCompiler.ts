import { UnclosedTagError } from '../errors';
import { LoopPlugin, SimpleTagPlugin, TemplatePlugin } from '../plugins';
import { ScopeManager } from './scopedManager';
import { Tag, TagDisposition } from './tag';
import { TagParser } from './tagParser';
import { Tokenizer } from './tokenizer';

/**
 * The TemplateCompiler works roughly the same way as a source code compiler.
 * It's main steps are:
 * 
 * 1. tokenize (lexical analysis) :: (Document) => Tokens[]
 * 2. create input AST (syntax analysis) :: (Tokens[]) => Tag
 * 3. perform document replace (code generation) :: (Document, Tag, data) => Document*
 * 
 * see: https://en.wikipedia.org/wiki/Compiler
 */
export class TemplateCompiler {

    private readonly plugins: TemplatePlugin[] = [new LoopPlugin(), new SimpleTagPlugin()];
    private readonly tokenizer = new Tokenizer();
    private readonly tagParser = new TagParser();

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(node: Node, data: any): void {
        const tokens = this.tokenizer.tokenize(node);
        const tags = this.tagParser.parse(tokens);
        this.doTagReplacements(node, tags, data);
    }

    //
    // private methods
    //

    private doTagReplacements(node: Node, tags: Tag[], data: any): void {

        this.plugins.forEach(plugin => plugin.setContext(this));

        const scopeManager = new ScopeManager(data);
        for (let i = 0; i < tags.length; i++) {

            const tag = tags[i];

            scopeManager.updateScopeBefore(tag);
            const scopedData = scopeManager.getScopedData();

            if (tag.disposition === TagDisposition.SelfClosed) {

                // replace simple tag
                for (const plugin of this.plugins) {
                    plugin.simpleTagReplacements(tag, scopedData);
                }

            } else if (tag.disposition === TagDisposition.Open) {

                // find the closing tag
                let closeTag: Tag;
                let j = i;
                for (; j < tags.length; j++) {
                    closeTag = tags[j];
                    if (closeTag.type === tag.type && closeTag.disposition === TagDisposition.Close) {
                        break;
                    }
                }
                if (j === tags.length)
                    throw new UnclosedTagError(tag.name);

                // replace container tag
                for (const plugin of this.plugins) {
                    plugin.containerTagReplacements(i, j, tags, scopedData);
                }
            }

            scopeManager.updateScopeAfter(tag);
        }
    }
}