import { TagTree, TagType } from '../compilation';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    /**
     * @inheritDoc
     */
    public doDocumentReplacements(doc: Document, tag: TagTree, data: any): void {

        // if (!data || !Array.isArray(data) || !data.length)
        //     tag.value = '';

        // for (const item of data) {
        //     for (const childTag of tagNode.children) {
                
        //     }
        // }
    }
}