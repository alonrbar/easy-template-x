import { Tag, TagType } from '../compilation/tag';

export abstract class TemplatePlugin {

    public abstract get tagType(): TagType;

    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     * 
     * @param doc The document to manipulate
     * @param data Relevant part of the data
     */
    public simpleTagReplacements(doc: Document, tag: Tag, data: any): void {
        // noop
    }

    /**
     * This method is called for each container tag.
     * It should implement the specific document manipulation required by the tag.
     * 
     * @param doc The document to manipulate
     * @param data Relevant part of the data
     */
    public containerTagReplacements(doc: Document, openTagIndex: number, closeTagIndex: number, allTags: Tag[], data: any): void {
        // noop
    }
}