import { ScopeData, Tag } from "src/compilation";
import { wml, WmlNode } from "src/office";
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

        // set text
        textNode.textContent = text;

        // make sure leading and trailing whitespace are preserved
        const wordTextNode = wml.query.containingTextNode(textNode);
        wml.modify.setSpacePreserveAttribute(wordTextNode);
    }

    private replaceMultiLine(textNode: XmlTextNode, lines: string[]) {

        const runNode = wml.query.containingRunNode(textNode);

        // first line
        textNode.textContent = lines[0];

        // other lines
        for (let i = 1; i < lines.length; i++) {

            // add line break
            const lineBreak = this.getLineBreak();
            xml.modify.appendChild(runNode, lineBreak);

            // add text
            const lineNode = this.createWordTextNode(lines[i]);
            xml.modify.appendChild(runNode, lineNode);
        }
    }

    private getLineBreak(): XmlNode {
        return xml.create.generalNode('w:br');
    }

    private createWordTextNode(text: string): XmlNode {
        const wordTextNode = xml.create.generalNode(WmlNode.Text);

        wordTextNode.attributes = {};
        wml.modify.setSpacePreserveAttribute(wordTextNode);

        wordTextNode.childNodes = [
            xml.create.textNode(text)
        ];

        return wordTextNode;
    }
}
