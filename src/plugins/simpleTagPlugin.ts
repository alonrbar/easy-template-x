import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { XmlNode } from '../xmlNode';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class SimpleTagPlugin extends TemplatePlugin {

    private static lineBreak: XmlNode;

    public readonly tagType = TagType.Simple;

    private xmlParser = new XmlParser();
    private docxParser = new DocxParser();

    /**
     * @inheritDoc
     */
    public simpleTagReplacements(tag: Tag, data: any): boolean {

        if (tag.type !== this.tagType)
            return false;

        const value = (data || '').split('\n');

        if (value.length < 2) {
            this.replaceSingleLine(tag.xmlTextNode, value.length ? value[0] : '');
        } else {
            this.replaceMultiLine(tag.xmlTextNode, value);
        }

        return true;
    }

    private replaceSingleLine(textNode: Text, text: string) {
        textNode.textContent = text;
    }

    private replaceMultiLine(textNode: Text, lines: string[]) {

        const runNode = this.docxParser.findRunNode(textNode);

        // first lint
        textNode.textContent = lines[0];

        // other lines
        for (let i = 1; i < lines.length; i++) {
            
            // add line break
            const lineBreak = this.getLineBreak();
            XmlNode.appendChild(runNode, lineBreak);

            // add text
            const lineNode = textNode.XmlNode.cloneNode(parentNode, );
            lineNode.textContent = lines[i];
            XmlNode.appendChild(runNode, lineNode);
        }
    }

    private getLineBreak(): XmlNode {
        if (!SimpleTagPlugin.lineBreak) {
            SimpleTagPlugin.lineBreak = this.xmlParser.parse('<dummyRoot><w:br/></dummyRoot>').documentElement.childNodes[0];
        }
        return SimpleTagPlugin.XmlNode.cloneNode(lineBreak, );
    }
}