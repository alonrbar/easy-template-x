import { TagTree, TagType } from "../compilation";

export abstract class TemplatePlugin {

    public abstract get tagType(): TagType;

    /**
     * This method is called for each node of the tags tree.
     * It should implement the specific document manipulation required by the tag.
     * 
     * @param doc The document to manipulate
     * @param tag Current tag node
     * @param data Relevant part of the data
     */
    public doDocumentReplacements(doc: Document, tag: TagTree, data: any): void {
        // noop
    }
}