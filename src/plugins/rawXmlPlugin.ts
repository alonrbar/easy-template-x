import { ScopeData, Tag, TagDisposition, TagPrefix } from '../compilation';
import { XmlNode } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

export class RawXmlPlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [{
        prefix: '@',
        tagType: 'rawXml',
        tagDisposition: TagDisposition.SelfClosed
    }];

    /**
     * Replace the current <w:t> node with the specified xml markup.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        const value = data.getScopeData();
        if (typeof value === 'string') {
            const newNode = this.utilities.xmlParser.parse(value);
            XmlNode.insertBefore(newNode, wordTextNode);
        }

        XmlNode.remove(wordTextNode);
    }
}