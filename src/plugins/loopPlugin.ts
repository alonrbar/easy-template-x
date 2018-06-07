import { Tag, TagType } from '../compilation/tag';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    /**
     * @inheritDoc
     */
    public containerTagReplacements(doc: Document, openTagIndex: number, closeTagIndex: number, allTags: Tag[], data: any): void {

        if (!data || !Array.isArray(data) || !data.length)
            data = [];

        // first paragraph
        // - get
        // - clone
        // - remove unnecessary parts

        // last paragraph
        // - get
        // - clone
        // - remove unnecessary parts

        // middle paragraphs
        // - get

        // create dummy document
        // compile to get new tags

        // modify tags collection

        // 1. re-merge first paragraphs
        // 2. insert middle paragraphs
        // 3. if (last iteration)
        //      re-merge last paragraph
        //    else
        //      merge last clone with next first clone and go to (2)

        // adjust compiler accordingly
    }
}