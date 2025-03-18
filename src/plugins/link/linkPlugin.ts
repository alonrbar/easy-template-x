import { ScopeData, Tag, TemplateContext } from "src/compilation";
import { RelType, oml, OmlNode } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml, XmlNode } from "src/xml";
import { LinkContent } from "./linkContent";

export class LinkPlugin extends TemplatePlugin {

    public readonly contentType = 'link';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const wordTextNode = oml.query.containingTextNode(tag.xmlTextNode);

        const content = data.getScopeData<LinkContent>();
        if (!content || !content.target) {
            xml.modify.remove(wordTextNode);
            return;
        }

        // add rel
        const relId = await context.currentPart.rels.add(content.target, RelType.Link, 'External');

        // generate markup
        const wordRunNode = oml.query.containingRunNode(wordTextNode);
        const linkMarkup = this.generateMarkup(content, relId, wordRunNode);

        // add to document
        this.insertHyperlinkNode(linkMarkup, wordRunNode, wordTextNode);
    }

    private generateMarkup(content: LinkContent, relId: string, wordRunNode: XmlNode) {

        // http://officeopenxml.com/WPhyperlink.php

        let tooltip = '';
        if (content.tooltip) {
            tooltip += `w:tooltip="${content.tooltip}" `;
        }

        const markupText = `
            <w:hyperlink r:id="${relId}" ${tooltip}w:history="1">
                <w:r>
                    <w:rPr>
                        <w:rStyle w:val="Hyperlink"/>
                    </w:rPr>
                    <w:t>${content.text || content.target}</w:t>
                </w:r>
            </w:hyperlink>
        `;
        const markupXml = xml.parser.parse(markupText);
        xml.modify.removeEmptyTextNodes(markupXml); // remove whitespace

        // copy props from original run node (preserve style)
        const runProps = wordRunNode.childNodes.find(node => node.nodeName === OmlNode.RunProperties);
        if (runProps) {
            const linkRunProps = xml.create.cloneNode(runProps, true);
            markupXml.childNodes[0].childNodes.unshift(linkRunProps);
        }

        return markupXml;
    }

    private insertHyperlinkNode(linkMarkup: XmlNode, tagRunNode: XmlNode, tagTextNode: XmlNode) {

        // Links are inserted at the 'run' level.
        // Therefor we isolate the link tag to it's own run (it is already
        // isolated to it's own text node), insert the link markup and remove
        // the run.
        let textNodesInRun = tagRunNode.childNodes.filter(node => node.nodeName === OmlNode.Text);
        if (textNodesInRun.length > 1) {

            const [runBeforeTag] = xml.modify.splitByChild(tagRunNode, tagTextNode, true);
            textNodesInRun = runBeforeTag.childNodes.filter(node => node.nodeName === OmlNode.Text);

            xml.modify.insertAfter(linkMarkup, runBeforeTag);
            if (textNodesInRun.length === 0) {
                xml.modify.remove(runBeforeTag);
            }
        }

        // already isolated
        else {
            xml.modify.insertAfter(linkMarkup, tagRunNode);
            xml.modify.remove(tagRunNode);
        }
    }
}
