import { Tag, TagType } from '../compilation/tag';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    /**
     * @inheritDoc
     */
    public containerTagReplacements(doc: Document, openTagIndex: number, closeTagIndex: number, allTags: Tag[], data: any): void {

        if (!data || !Array.isArray(data) || !data.length)
            data = [{}];

        for (const item of data) {
            console.log(item);
        }
    }
}