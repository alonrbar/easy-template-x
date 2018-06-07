import { Tag, TagType } from '../compilation/tag';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class SimpleTagPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Simple;

    public xmlParser = new XmlParser();

    /**
     * @inheritDoc
     */
    public simpleTagReplacements(tag: Tag, data: any): boolean {

        if (tag.type !== this.tagType)
            return false;

        // TODO: line breaks        

        const value = this.xmlParser.encode(data || '');
        tag.xmlNode.textContent = value;

        return true;
    }
}