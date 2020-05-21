import { ScopeData, Tag, TemplateContext } from '../../compilation';
import { DocxParser } from '../../office';
import { XmlNode } from '../../xml';
import { TemplatePlugin } from '../templatePlugin';
import { LinkContent } from './linkContent';

export class LinkPlugin extends TemplatePlugin {

    private static readonly linkRelType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink';

    public readonly contentType = 'link';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        const content = data.getScopeData<LinkContent>();
        if (!content || !content.target) {
            XmlNode.remove(wordTextNode);
            return;
        }

        // add rel
        const relId = await context.currentPart.rels.add(content.target, LinkPlugin.linkRelType, 'External');

        // generate markup
        const wordRunNode = this.utilities.docxParser.containingRunNode(wordTextNode);
        const linkMarkup = this.generateMarkup(content, relId, wordRunNode);

        // add to document
        this.insertHyperlinkNode(linkMarkup, wordRunNode, wordTextNode);
    }

    private generateMarkup(content: LinkContent, relId: string, wordRunNode: XmlNode) {

        // http://officeopenxml.com/WPhyperlink.php

        const markupText = `
            <w:hyperlink r:id="${relId}" w:history="1">
                <w:r>
                    <w:t>${content.text || content.target}</w:t>
                </w:r>
            </w:hyperlink>
        `;
        const markupXml = this.utilities.xmlParser.parse(markupText);
        XmlNode.removeEmptyTextNodes(markupXml); // remove whitespace

        // copy props from original run node (preserve style)
        const runProps = wordRunNode.childNodes.find(node => node.nodeName === DocxParser.RUN_PROPERTIES_NODE);
        if (runProps) {
            const linkRunProps = XmlNode.cloneNode(runProps, true);
            markupXml.childNodes[0].childNodes.unshift(linkRunProps);
        }

        return markupXml;
    }

    private insertHyperlinkNode(linkMarkup: XmlNode, tagRunNode: XmlNode, tagTextNode: XmlNode) {

        // Links are inserted at the 'run' level.
        // Therefor we isolate the link tag to it's own run (it is already
        // isolated to it's own text node), insert the link markup and remove
        // the run.
        let textNodesInRun = tagRunNode.childNodes.filter(node => node.nodeName === DocxParser.TEXT_NODE);
        if (textNodesInRun.length > 1) {

            const [runBeforeTag] = XmlNode.splitByChild(tagRunNode, tagTextNode, true);
            textNodesInRun = runBeforeTag.childNodes.filter(node => node.nodeName === DocxParser.TEXT_NODE);

            XmlNode.insertAfter(linkMarkup, runBeforeTag);
            if (textNodesInRun.length === 0) {
                XmlNode.remove(runBeforeTag);
            }
        }

        // already isolated
        else {
            XmlNode.insertAfter(linkMarkup, tagRunNode);
            XmlNode.remove(tagRunNode);
        }
    }
}
