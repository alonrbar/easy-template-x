import { ScopeData, Tag, TagDisposition, TagPrefix } from '../compilation';
import { DocxParser } from '../docxParser';
import { XmlNode } from '../xmlNode';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class RawXmlPlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [{
        prefix: '@',
        tagType: 'rawXml',
        tagDisposition: TagDisposition.SelfClosed
    }];

    private docxParser = new DocxParser();
    private xmlParser = new XmlParser();

    /**
     * @inheritDoc
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const wordTextNode = this.docxParser.containingTextNode(tag.xmlTextNode);

        const value = data.getScopeData();
        if (typeof value === 'string') {
            const newNode = this.xmlParser.parse(value);
            XmlNode.insertBefore(newNode, wordTextNode);
        }

        XmlNode.remove(wordTextNode);
    }
}