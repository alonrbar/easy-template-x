import { ScopeData, Tag } from "src/compilation";
import { wml } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { RawXmlContent } from "./rawXmlContent";

export class RawXmlPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXml';

    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const value = data.getScopeData<RawXmlContent>();

        const replaceNode = value?.replaceParagraph ?
            wml.query.containingParagraphNode(tag.xmlTextNode) :
            wml.query.containingTextNode(tag.xmlTextNode);

        if (typeof value?.xml === 'string') {
            const newNode = xml.parser.parse(value.xml);
            xml.modify.insertBefore(newNode, replaceNode);
        }

        xml.modify.remove(replaceNode);
    }
}
