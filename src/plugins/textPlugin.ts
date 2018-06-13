import { ScopeData, Tag, TagDisposition, TagPrefix } from '../compilation';
import { DocxParser } from '../docxParser';
import { XmlAttribute, XmlGeneralNode, XmlNode, XmlNodeType, XmlTextNode } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

export class TextPlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [{
        prefix: '',
        tagType: 'text',
        tagDisposition: TagDisposition.SelfClosed
    }];

    /**
     * Replace the node text content with the specified value.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {

        const value = (data.getScopeData() || '').split('\n');

        if (value.length < 2) {
            this.replaceSingleLine(tag.xmlTextNode, value.length ? value[0] : '');
        } else {
            this.replaceMultiLine(tag.xmlTextNode, value);
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

        // first lint
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
        return {
            nodeType: XmlNodeType.General,
            nodeName: 'w:br'
        };
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