import { ScopeData, Tag } from '../../compilation';
import { DocxParser } from '../../office';
import { stringValue } from '../../utils';
import { XmlNode, XmlTextNode } from '../../xml';
import { TemplatePlugin } from '../templatePlugin';

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
        const wordTextNode = this.utilities.docxParser.containingTextNode(textNode);
        this.utilities.docxParser.setSpacePreserveAttribute(wordTextNode);
    }

    private replaceMultiLine(textNode: XmlTextNode, lines: string[]) {

        const runNode = this.utilities.docxParser.containingRunNode(textNode);

        // first line
        textNode.textContent = lines[0];

        // other lines
        for (let i = 1; i < lines.length; i++) {

            // add line break
            const lineBreak = this.getLineBreak();
            XmlNode.appendChild(runNode, lineBreak);

            // add text
            const lineNode = this.createWordTextNode(lines[i]);
            XmlNode.appendChild(runNode, lineNode);
        }
    }

    private getLineBreak(): XmlNode {
        return XmlNode.createGeneralNode('w:br');
    }

    private createWordTextNode(text: string): XmlNode {
        const wordTextNode = XmlNode.createGeneralNode(DocxParser.TEXT_NODE);

        wordTextNode.attributes = {};
        this.utilities.docxParser.setSpacePreserveAttribute(wordTextNode);

        wordTextNode.childNodes = [
            XmlNode.createTextNode(text)
        ];

        return wordTextNode;
    }
}
