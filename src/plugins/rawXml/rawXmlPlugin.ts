import { ScopeData, Tag } from "src/compilation";
import { officeMarkup } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { RawXmlContent } from "./rawXmlContent";

export class RawXmlPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXml';

    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const value = data.getScopeData<RawXmlContent>();

        const replaceNode = value?.replaceParagraph ?
            officeMarkup.query.containingParagraphNode(tag.xmlTextNode) :
            officeMarkup.query.containingTextNode(tag.xmlTextNode);

        if (typeof value?.xml === 'string') {
            const newNode = xml.parser.parse(value.xml);
            xml.modify.insertBefore(newNode, replaceNode);
        }

        if (value?.replaceParagraph) {
            xml.modify.remove(replaceNode);
        } else {
            officeMarkup.modify.removeTag(tag.xmlTextNode);
        }
    }
}
