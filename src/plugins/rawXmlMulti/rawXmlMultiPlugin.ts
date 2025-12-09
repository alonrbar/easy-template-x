import { ScopeData } from "src/compilation/scopeData";
import { Tag, TagPlacement } from "src/compilation/tag";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { RawXmlMultiParagraphContent } from "./rawXmlMultiParagraphContent";

export class RawXmlMultiPlugin extends TemplatePlugin {

    public readonly contentType = 'rawXmlMultiParagraph';

    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        if (tag.placement !== TagPlacement.TextNode) {
            throw new TemplateSyntaxError(`RawXml tag "${tag.rawText}" must be placed in a text node but was placed in ${tag.placement}`);
        }

        const value = data.getScopeData<RawXmlMultiParagraphContent>();

        const replaceNode = value?.replaceParagraph ?
            officeMarkup.query.containingParagraphNode(tag.xmlTextNode) :
            officeMarkup.query.containingTextNode(tag.xmlTextNode);

        if (Array.isArray(value?.xml)) {
            // Join all xml strings
            const allXml = value.xml.join('');

            // Wrap in dummy root to allow multiple top-level elements
            // (e.g. multiple paragraphs)
            const wrappedXml = `<root>${allXml}</root>`;
            const parsedRoot = xml.parser.parse(wrappedXml);
            
            // Iterate over children and insert them
            // Note: We iterate over a copy of the array because inserting children
            // modifies their parent pointers, although strictly adhering to the
            // xml module logic, it doesn't remove them from the old parent's childNodes array.
            // But to be safe and clean, we iterate.
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
