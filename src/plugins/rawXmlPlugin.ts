import { ScopeData, Tag } from '../compilation';
import { XmlNode } from '../xml';
import { RawXmlContent } from './rawXmlContent';
import { TemplatePlugin } from './templatePlugin';

export class RawXmlPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXml';

    /**
     * If TemplateData.replaceParagraph === true
     * Replace the parent <w:p> for current <w:t> node with the specified xml markup.
     * otherwise
     * Replace the current <w:t> node with the specified xml markup.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        let replaceNode: XmlNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        const value = data.getScopeData<RawXmlContent>();
        if (value && typeof value.xml === 'string') {
            if(value.replaceParagraph === true) {
                replaceNode = this.utilities.docxParser.containingParagraphNode(tag.xmlTextNode);
            }

            const newNode = this.utilities.xmlParser.parse(value.xml);
            XmlNode.insertBefore(newNode, replaceNode);
        }

        XmlNode.remove(replaceNode);
    }
}
