import { ScopeData, Tag } from '../compilation';
import { XmlNode } from '../xml';
import { TemplatePlugin } from './templatePlugin';

export interface RawXmlContent {
    _type: 'rawXml';
    xml: string;
}

export class RawXmlPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXml';

    /**
     * Replace the current <w:t> node with the specified xml markup.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        const value: RawXmlContent = data.getScopeData();
        if (value && typeof value.xml === 'string') {
            const newNode = this.utilities.xmlParser.parse(value.xml);
            XmlNode.insertBefore(newNode, wordTextNode);
        }

        XmlNode.remove(wordTextNode);
    }
}