import { ScopeData } from "src/compilation/scopeData";
import { Tag, TagPlacement } from "src/compilation/tag";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { RawXmlContent } from "./rawXmlContent";

export class RawXmlPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXml';

    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        if (tag.placement !== TagPlacement.TextNode) {
            throw new TemplateSyntaxError(`RawXml tag "${tag.rawText}" must be placed in a text node but was placed in ${tag.placement}`);
        }

        const value = data.getScopeData<RawXmlContent>();

        const replaceNode = value?.replaceParagraph ?
            officeMarkup.query.containingParagraphNode(tag.xmlTextNode) :
            officeMarkup.query.containingTextNode(tag.xmlTextNode);

        if (
            typeof value?.xml === 'string' ||
            (Array.isArray(value?.xml) && value.xml.every(item => typeof item === "string"))
        ) {
            // Parse the xml content
            const xmlContent = Array.isArray(value.xml) ? value.xml.join('') : value.xml;
            const wrappedXml = `<root>${xmlContent}</root>`;
            const parsedRoot = xml.parser.parse(wrappedXml);

            // Insert the xml content
            const children = [...(parsedRoot.childNodes || [])];
            for (const child of children) {
                xml.modify.insertBefore(child, replaceNode);
            }
        }

        if (value?.replaceParagraph) {
            xml.modify.remove(replaceNode);
        } else {
            officeMarkup.modify.removeTag(tag);
        }
    }
}
