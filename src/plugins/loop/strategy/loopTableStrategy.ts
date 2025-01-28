import { Tag } from '../../../compilation';
import { XmlNode } from '../../../xml';
import { PluginUtilities } from '../../templatePlugin';
import { LoopOver, LoopTagOptions } from '../loopTagOptions';
import { ILoopStrategy, SplitBeforeResult } from './iLoopStrategy';

export class LoopTableStrategy implements ILoopStrategy {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
    }

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        const openParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
        if (!openParagraph.parentNode)
            return false;

        if (!this.utilities.docxParser.isTableCellNode(openParagraph.parentNode))
            return false;

        const closeParagraph = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);
        if (!closeParagraph.parentNode)
            return false;

        if (!this.utilities.docxParser.isTableCellNode(closeParagraph.parentNode))
            return false;

        const options = openTag.options as LoopTagOptions;
        const forceRowLoop = options?.loopOver === LoopOver.Row;

        // If both tags are in the same cell, assume it's a paragraph loop (iterate content, not rows).
        if (!forceRowLoop && openParagraph.parentNode === closeParagraph.parentNode)
            return false;

        return true;
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        const firstRow = this.utilities.docxParser.containingTableRowNode(openTag.xmlTextNode);
        const lastRow = this.utilities.docxParser.containingTableRowNode(closeTag.xmlTextNode);
        const rowsToRepeat = XmlNode.siblingsInRange(firstRow, lastRow);

        // remove the loop tags
        XmlNode.remove(openTag.xmlTextNode);
        XmlNode.remove(closeTag.xmlTextNode);

        return {
            firstNode: firstRow,
            nodesToRepeat: rowsToRepeat,
            lastNode: lastRow
        };
    }

    public mergeBack(rowGroups: XmlNode[][], firstRow: XmlNode, lastRow: XmlNode): void {

        for (const curRowsGroup of rowGroups) {
            for (const row of curRowsGroup) {
                XmlNode.insertBefore(row, lastRow);
            }
        }

        // remove the old rows
        XmlNode.remove(firstRow);
        if (firstRow !== lastRow) {
            XmlNode.remove(lastRow);
        }
    }
}
