import { ScopeData, Tag } from '../../compilation';
import { XmlNode } from '../../xml';
import { TemplatePlugin } from '../templatePlugin';
import { RawXmlContent } from './rawXmlContent';

export class RawXmlPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXml';

    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        let replaceNode: XmlNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        const value = data.getScopeData<RawXmlContent>();
        if (value && typeof value.xml === 'string') {
            if (value.replaceParagraph === true) {
                replaceNode = this.utilities.docxParser.containingParagraphNode(tag.xmlTextNode);
            }

            const newNode = this.utilities.xmlParser.parse(value.xml);
            XmlNode.insertBefore(newNode, replaceNode);
        }

        XmlNode.remove(replaceNode);
    }
}
