import { TagTree } from './tagTree';
import { TagTreeComposer } from './tagTreeComposer';
import { Tokenizer } from './tokenizer';

/**
 * The TemplateCompiler works roughly the same way as a source code compiler.
 * It's main steps are:
 * 
 * 1. tokenize (lexical analysis) :: (Document) => Tokens[]
 * 2. create input AST (syntax analysis) :: (Tokens[]) => TagTree
 * 3. render output AST (code generation) :: (TagTree, data) => TagTree*
 * 4. perform document replace :: (Document, TagTree*) => Document*
 * 
 * see: https://en.wikipedia.org/wiki/Compiler
 */
export class TemplateCompiler {

    private readonly tokenizer = new Tokenizer();
    private readonly tagTreeComposer = new TagTreeComposer();

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(doc: Document, data: any): void {
        const tokens = this.tokenizer.tokenize(doc);
        const tagTree = this.tagTreeComposer.composeTree(tokens);
        this.doTagReplacements(tagTree, data);
        this.doDocumentReplacements(doc, tagTree);
    }

    //
    // private methods
    //

    private doTagReplacements(tagTree: TagTree[], data: any): void {
        // TODO...
    }

    private doDocumentReplacements(doc: Document, tagTree: TagTree[]): void {
        // TODO...
    }

}