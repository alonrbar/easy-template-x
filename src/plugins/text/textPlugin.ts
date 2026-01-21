import { ScopeData } from "src/compilation/scopeData";
import { AttributeTag, Tag, TagPlacement, TextNodeTag } from "src/compilation/tag";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { stringValue } from "src/utils";
import { xml, XmlNode } from "src/xml";

export const TEXT_CONTENT_TYPE = 'text';

export class TextPlugin extends TemplatePlugin {

    public readonly contentType = TEXT_CONTENT_TYPE;

    /**
     * Replace the node text content with the specified value.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const value = data.getScopeData();
        const strValue = stringValue(value);

        if (tag.placement === TagPlacement.TextNode) {
            this.replaceInTextNode(tag, strValue);
            return;
        }

        if (tag.placement === TagPlacement.Attribute) {
            this.replaceInAttribute(tag, strValue);
            return;
        }

        const anyTag = tag as any;
        throw new TemplateSyntaxError(`Unexpected tag placement "${anyTag.placement}" for tag "${anyTag.rawText}".`);
    }

    private replaceInTextNode(tag: TextNodeTag, text: string) {
        const lines = text.split('\n');

        if (lines.length < 2) {
            this.replaceSingleLine(tag, lines.length ? lines[0] : '');
        } else {
            this.replaceMultiLine(tag, lines);
        }
    }

    private replaceInAttribute(tag: AttributeTag, text: string) {

        // Set text
        tag.xmlNode.attributes[tag.attributeName] = tag.xmlNode.attributes[tag.attributeName].replace(tag.rawText, text);

        // Remove the attribute if it's empty
        if (!text) {
            officeMarkup.modify.removeTag(tag);
            return;
        }
    }

    private replaceSingleLine(tag: TextNodeTag, text: string) {

        // Set text
        const textNode = tag.xmlTextNode;
        textNode.textContent = text;

        // Clean up if the text node is now empty
        if (!text) {
            officeMarkup.modify.removeTag(tag);
            return;
        }

        // Make sure leading and trailing whitespace are preserved
        const wordTextNode = officeMarkup.query.containingTextNode(textNode);
        officeMarkup.modify.setSpacePreserveAttribute(wordTextNode);
    }

    private replaceMultiLine(tag: TextNodeTag, lines: string[]) {

        const textNode = tag.xmlTextNode;
        const runNode = officeMarkup.query.containingRunNode(textNode);
        const namespace = runNode.nodeName.split(':')[0];

        // First line
        const firstLine = lines[0];
        textNode.textContent = firstLine;

        // Other lines
        for (let i = 1; i < lines.length; i++) {

            // Add line break
            const lineBreak = this.getLineBreak(namespace);
            xml.modify.appendChild(runNode, lineBreak);

            // Add text
            if (lines[i]) {
                const lineNode = this.createOfficeTextNode(namespace, lines[i]);
                xml.modify.appendChild(runNode, lineNode);
            }
        }

        // Clean up if the original text node is now empty
        if (!firstLine) {
            officeMarkup.modify.removeTag(tag);
        }
    }

    private getLineBreak(namespace: string): XmlNode {
        return xml.create.generalNode(namespace + ':br');
    }

    private createOfficeTextNode(namespace: string, text: string): XmlNode {
        const wordTextNode = xml.create.generalNode(namespace + ':t');

        wordTextNode.attributes = {};
        officeMarkup.modify.setSpacePreserveAttribute(wordTextNode);

        wordTextNode.childNodes = [
            xml.create.textNode(text)
        ];

        return wordTextNode;
    }
}
