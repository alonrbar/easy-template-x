import { Tag, TagType } from '../compilation/tag';
import { TemplateCompiler } from '../compilation/templateCompiler';

export abstract class TemplatePlugin {

    public abstract get tagType(): TagType;

    protected compiler: TemplateCompiler;

    public setContext(compiler: TemplateCompiler) {
        this.compiler = compiler;
    }

    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     * It should return true if successfully replaced.
     * 
     * @param data Relevant part of the data
     */
    public simpleTagReplacements(tag: Tag, data: any): void {
        // noop
    }

    /**
     * This method is called for each container tag.
     * It should implement the specific document manipulation required by the tag.
     * It should return true if successfully replaced.
     * 
     * @param tags All tags between the opening tag and the closing tag (inclusive).
     * @param data Relevant part of the data
     */
    public containerTagReplacements(tags: Tag[], data: any): void {
        // noop
    }
}