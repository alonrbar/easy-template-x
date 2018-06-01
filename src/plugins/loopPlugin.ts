import { TagTree, TagType } from '../compilation';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    /**
     * @inheritDoc
     */
    public setTagValue(path: string[], tagNode: TagTree, data: any): void {
        if (tagNode.type !== TagType.Loop)
            return;

        if (!data || !Array.isArray(data) || !data.length)
            tagNode.value = '';

        for (const item of data) {
            for (const childTag of tagNode.children) {
                
            }
        }
    }
}