import { TemplateContext, TextNodeTag } from "src/compilation";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup, OmlNode } from "src/office";
import { getRepeatMode, LoopTagOptions, RepeatMode } from "src/plugins/loop/loopTagOptions";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopParagraphStrategy implements ILoopStrategy {

    public async isApplicable(openTag: TextNodeTag, closeTag: TextNodeTag, isCondition: boolean, context: TemplateContext): Promise<boolean> {
        const options = openTag.options as LoopTagOptions;

        // Explicit repeat mode.
        const repeatMode = getRepeatMode(options);
        if (repeatMode) {
            return repeatMode === RepeatMode.Paragraph;
        }

        if (!context.options.preferParagraphLoops) {
            return false;
        }

        // Check if the paragraphs are siblings.
        const firstParagraph = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        const lastParagraph = officeMarkup.query.containingParagraphNode(closeTag.xmlTextNode);
        if (firstParagraph.parentNode !== lastParagraph.parentNode) {
            return false;
        }

        // Check that the loop tags are not in the same paragraph.
        if (firstParagraph === lastParagraph) {
            return false;
        }

        // Check if each loop tag is alone in its paragraph.
        const openTextNode = officeMarkup.query.containingTextNode(openTag.xmlTextNode);
        const closeTextNode = officeMarkup.query.containingTextNode(closeTag.xmlTextNode);
        const openTagAlone = this.isEmptyParagraph(firstParagraph, [openTextNode]);
        const closeTagAlone = this.isEmptyParagraph(lastParagraph, [closeTextNode]);
        return openTagAlone && closeTagAlone;
    }

    public splitBefore(openTag: TextNodeTag, closeTag: TextNodeTag, context: TemplateContext): SplitBeforeResult {
        const firstParagraph = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        const lastParagraph = officeMarkup.query.containingParagraphNode(closeTag.xmlTextNode);

        // Make sure the paragraphs are siblings.
        if (firstParagraph.parentNode !== lastParagraph.parentNode) {
            throw new TemplateSyntaxError(`Open and close tags are not in the same container: ${openTag.rawText} and ${closeTag.rawText}. For example, one is inside a table cell and the other is not.`);
        }

        let paragraphsToRepeat = xml.query.siblingsInRange(firstParagraph, lastParagraph);

        // Remove the loop tags.
        xml.modify.remove(openTag.xmlTextNode);
        xml.modify.remove(closeTag.xmlTextNode);

        // The first and last paragraphs are skipped if they are empty after removing the tag.
        if (context.options.preferParagraphLoops) {
            if (this.isEmptyParagraph(firstParagraph)) {
                paragraphsToRepeat = paragraphsToRepeat.slice(1);
            }
            if (this.isEmptyParagraph(lastParagraph)) {
                paragraphsToRepeat = paragraphsToRepeat.slice(0, -1);
            }
        }

        return {
            firstNode: firstParagraph,
            nodesToRepeat: paragraphsToRepeat,
            lastNode: lastParagraph
        };
    }

    public mergeBack(newParagraphs: XmlNode[][], firstParagraph: XmlNode, lastParagraph: XmlNode): void {

        // Add new paragraphs to the document.
        let insertAfter = lastParagraph;
        for (const curParagraphsGroup of newParagraphs) {
            for (const paragraph of curParagraphsGroup) {
                xml.modify.insertAfter(paragraph, insertAfter);
                insertAfter = paragraph;
            }
        }

        // We cannot leave table cells completely empty, so we track them.
        // See: http://officeopenxml.com/WPtableCell.php
        const firstTableCell = officeMarkup.query.containingTableCellNode(firstParagraph);
        const lastTableCell = officeMarkup.query.containingTableCellNode(lastParagraph);

        // Remove old paragraphs - between first and last paragraph.
        xml.modify.removeSiblings(firstParagraph, lastParagraph);

        // Remove old paragraphs - first and last.
        xml.modify.remove(firstParagraph);
        if (firstParagraph !== lastParagraph) {
            xml.modify.remove(lastParagraph);
        }

        // Make sure the table cells are not empty (if they exist).
        this.fillTableCell(firstTableCell);
        this.fillTableCell(lastTableCell);
    }

    private fillTableCell(tableCell: XmlGeneralNode): void {
        if (
            tableCell &&
            !tableCell.childNodes?.find(node => officeMarkup.query.isParagraphNode(node)) &&
            !tableCell.childNodes?.find(node => officeMarkup.query.isTableNode(node))
        ) {
            xml.modify.appendChild(tableCell, xml.create.generalNode(OmlNode.W.Paragraph));
        }
    }

    private isEmptyParagraph(node: XmlNode, ignoreWordTextNodes?: XmlNode[]): boolean {
        if (!officeMarkup.query.isParagraphNode(node))
            throw new Error(`Paragraph node expected but '${node.nodeName}' received.`);

        for (const child of (node.childNodes ?? [])) {

            // Paragraph properties nodes:
            if (officeMarkup.query.isParagraphPropertiesNode(child)) {

                // We consider section break paragraphs to be non-empty.
                if (xml.query.findChild(child, n => n.nodeName === OmlNode.W.SectionProperties)) {
                    return false;
                }

                // Other paragraph properties are ignored.
                continue;
            }

            // Ignore empty runs.
            if (officeMarkup.query.isRunNode(child) && officeMarkup.query.isEmptyRun(child, {
                ignoreWhitespace: true,
                ignoreNodes: ignoreWordTextNodes
            })) {
                continue;
            }

            // Ignore bookmarks and proof errors nodes.
            if (
                child.nodeName === OmlNode.W.BookmarkStart ||
                child.nodeName === OmlNode.W.BookmarkEnd ||
                child.nodeName === OmlNode.W.ProofError
            ) {
                continue;
            }

            // Ignore empty text nodes.
            if (xml.query.isTextNode(child) && !child.textContent?.trim()) {
                continue;
            }

            // Everything else is considered content.
            return false;
        }

        return true;
    }
}
