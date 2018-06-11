import { Tag, TagDisposition, TagPrefix } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { XmlNode, XmlNodeType } from '../xmlNode';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class RawXmlPlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [{
        prefix: '@',
        tagDisposition: TagDisposition.SelfClosed
    }];

    private docxParser = new DocxParser();
    private xmlParser = new XmlParser();

    /**
     * @inheritDoc
     */
    public simpleTagReplacements(tag: Tag, data: any): void {

        const wordTextNode = this.docxParser.containingTextNode(tag.xmlTextNode);

        if (data) {
            const newNode = this.xmlParser.parse(data);
            XmlNode.insertBefore(newNode, wordTextNode);
        } else {
            const newNode: XmlNode = {
                nodeType: XmlNodeType.General,
                nodeName: 'w:br',
                attributes: [{
                    name: 'w:type',
                    value: 'page'
                }]
            };
            XmlNode.insertBefore(newNode, wordTextNode);
        }

        XmlNode.remove(wordTextNode);
    }
}