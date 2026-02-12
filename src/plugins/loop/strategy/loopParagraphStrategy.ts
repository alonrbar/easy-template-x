import { TextNodeTag } from "src/compilation";
import { officeMarkup, OmlNode } from "src/office";
import { LoopOver, LoopTagOptions } from "src/plugins/loop/loopTagOptions";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopParagraphStrategy implements ILoopStrategy {

    public isApplicable(openTag: TextNodeTag, closeTag: TextNodeTag, isCondition: boolean): boolean {
        const options = openTag.options as LoopTagOptions;
        return options?.loopOver === LoopOver.Paragraph;
    }

    public splitBefore(openTag: TextNodeTag, closeTag: TextNodeTag): SplitBeforeResult {
        const firstParagraph = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        const lastParagraph = officeMarkup.query.containingParagraphNode(closeTag.xmlTextNode);
        const paragraphsToRepeat = xml.query.siblingsInRange(firstParagraph, lastParagraph);

        // Remove the loop tags.
        xml.modify.remove(openTag.xmlTextNode);
        xml.modify.remove(closeTag.xmlTextNode);

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
        if (newParagraphs.length === 0) {
            this.fillTableCell(firstTableCell);
            this.fillTableCell(lastTableCell);
        }
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
}
