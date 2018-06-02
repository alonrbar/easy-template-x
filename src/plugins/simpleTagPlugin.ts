import { Tag, TagType } from '../compilation/tag';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class SimpleTagPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Simple;

    /**
     * @inheritDoc
     */
    public doDocumentReplacements(doc: Document, tag: Tag, data: any): void {

        if (tag.type !== this.tagType)
            return;

        // TODO: line breaks        

        const value = XmlParser.encode(data);
        tag.xmlNode.textContent = value;
    }
}