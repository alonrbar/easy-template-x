import { Tag } from './tag';
import { TemplateToken } from './templateToken';
import { Tokenizer } from './tokenizer';

/**
 * The TemplateCompiler works roughly the same way as a source code compiler.
 * It's main steps are:
 * 
 * 1. tokenize (lexical analysis) :: (Document) => Tokens[]
 * 2. create input AST (syntax analysis) :: (Tokens[]) => TagTree
 * 3. render output AST (code generation) :: (TagTree, data) => TagTree*
 * 4. perform document replace :: (TagTree*) => Document
 * 
 * see: https://en.wikipedia.org/wiki/Compiler
 */
export class TemplateCompiler {
    
    private readonly tokenizer = new Tokenizer();

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    public compile(doc: Document, data: any): void {
        const tokens = this.tokenizer.tokenize(doc);
        const tagTree = this.createTagTree(tokens);
        this.doTagReplacements(tagTree, data);
        this.doDocumentReplacements(doc, tagTree);
    }

    //
    // private methods
    //

    private createTagTree(tokens: TemplateToken[]): Tag {
        return null;
    }

    private doTagReplacements(tagTree: Tag, data: any): void {
        // TODO...
    }

    private doDocumentReplacements(doc: Document, tagTree: Tag): void {
        // TODO...
    }

}