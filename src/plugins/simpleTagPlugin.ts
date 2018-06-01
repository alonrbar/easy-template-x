import { TagTree, TagType } from '../compilation';
import { TemplatePlugin } from './templatePlugin';

export class SimpleTagPlugin extends TemplatePlugin {

    /**
     * @inheritDoc
     */
    public setTagValue(path: string[], tagNode: TagTree, data: any): void {
        if (tagNode.type !== TagType.Simple)
            return;
        tagNode.value = data;
    }
}