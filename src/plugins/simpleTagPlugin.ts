import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class SimpleTagPlugin extends TemplatePlugin {

    private static lineBreak: Node;

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
            runNode.appendChild(lineBreak);

            // add text
            const lineNode = textNode.parentNode.cloneNode();
            lineNode.textContent = lines[i];
            runNode.appendChild(lineNode);
        }
    }

    private getLineBreak(): Node {
        if (!SimpleTagPlugin.lineBreak) {
            SimpleTagPlugin.lineBreak = this.xmlParser.parse('<dummyRoot><w:br/></dummyRoot>').documentElement.firstChild;
        }
        return SimpleTagPlugin.lineBreak.cloneNode();
    }
}