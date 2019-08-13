import { ScopeData, Tag } from '../compilation';
import { DocxParser } from '../office';
import { XmlAttribute, XmlGeneralNode, XmlNode, XmlTextNode } from '../xml';
import { TemplatePlugin } from './templatePlugin';

export const TEXT_CONTENT_TYPE = 'text';

export class TextPlugin extends TemplatePlugin {

    public readonly contentType = TEXT_CONTENT_TYPE;

    /**
     * Replace the node text content with the specified value.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const value = data.getScopeData();
        const stringValue = (value === null || value === undefined) ? '' : value.toString();
        const lines = stringValue.split('\n');

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
        const wordTextNode = this.utilities.docxParser.containingTextNode(textNode) as XmlGeneralNode;
        if (!wordTextNode.attributes) {
            wordTextNode.attributes = [];
        }
        if (!wordTextNode.attributes.find(attr => attr.name === 'xml:space')) {
            wordTextNode.attributes.push(this.getSpacePreserveAttribute());
        }
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

    private getSpacePreserveAttribute(): XmlAttribute {
        return {
            name: 'xml:space',
            value: 'preserve'
        };
    }

    private getLineBreak(): XmlNode {
        return XmlNode.createGeneralNode('w:br');
    }

    private createWordTextNode(text: string): XmlNode {
        const wordTextNode = XmlNode.createGeneralNode(DocxParser.TEXT_NODE);
        wordTextNode.attributes = [this.getSpacePreserveAttribute()];
        wordTextNode.childNodes = [
            XmlNode.createTextNode(text)
        ];
        return wordTextNode;
    }    
}