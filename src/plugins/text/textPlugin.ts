import { ScopeData, Tag } from "src/compilation";
import { officeMarkup } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { stringValue } from "src/utils";
import { xml, XmlNode, XmlTextNode } from "src/xml";

export const TEXT_CONTENT_TYPE = 'text';

export class TextPlugin extends TemplatePlugin {

    public readonly contentType = TEXT_CONTENT_TYPE;

    /**
     * Replace the node text content with the specified value.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const value = data.getScopeData();
        const lines = stringValue(value).split('\n');

        if (lines.length < 2) {
            this.replaceSingleLine(tag.xmlTextNode, lines.length ? lines[0] : '');
        } else {
            this.replaceMultiLine(tag.xmlTextNode, lines);
        }
    }

    private replaceSingleLine(textNode: XmlTextNode, text: string) {

        // Set text
        textNode.textContent = text;

        // Clean up if the text node is now empty
        if (!text) {
            officeMarkup.modify.removeTag(textNode);
            return;
        }

        // Make sure leading and trailing whitespace are preserved
        const wordTextNode = officeMarkup.query.containingTextNode(textNode);
        officeMarkup.modify.setSpacePreserveAttribute(wordTextNode);
    }

    private replaceMultiLine(textNode: XmlTextNode, lines: string[]) {

        const runNode = officeMarkup.query.containingRunNode(textNode);
        const namespace = runNode.nodeName.split(':')[0];

        // First line
        if (lines[0]) {
            textNode.textContent = lines[0];
        }

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
