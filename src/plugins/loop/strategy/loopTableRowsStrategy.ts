import { Tag } from "src/compilation";
import { oml } from "src/office";
import { xml, XmlNode } from "src/xml";
import { LoopOver, LoopTagOptions } from "../loopTagOptions";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopTableRowsStrategy implements ILoopStrategy {

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        const openCell = oml.query.containingTableCellNode(openTag.xmlTextNode);
        if (!openCell)
            return false;

        const closeCell = oml.query.containingTableCellNode(closeTag.xmlTextNode);
        if (!closeCell)
            return false;

        const options = openTag.options as LoopTagOptions;
        const forceRowLoop = options?.loopOver === LoopOver.Row;

        // If both tags are in the same cell, assume it's a paragraph loop (iterate content, not rows).
        if (!forceRowLoop && openCell === closeCell)
            return false;

        return true;
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        const firstRow = oml.query.containingTableRowNode(openTag.xmlTextNode);
        const lastRow = oml.query.containingTableRowNode(closeTag.xmlTextNode);
        const rowsToRepeat = xml.query.siblingsInRange(firstRow, lastRow);

        // remove the loop tags
        xml.modify.remove(openTag.xmlTextNode);
        xml.modify.remove(closeTag.xmlTextNode);

        return {
            firstNode: firstRow,
            nodesToRepeat: rowsToRepeat,
            lastNode: lastRow
        };
    }

    public mergeBack(rowGroups: XmlNode[][], firstRow: XmlNode, lastRow: XmlNode): void {

        for (const curRowsGroup of rowGroups) {
            for (const row of curRowsGroup) {
                xml.modify.insertBefore(row, lastRow);
            }
        }

        // remove the old rows
        xml.modify.remove(firstRow);
        if (firstRow !== lastRow) {
            xml.modify.remove(lastRow);
        }
    }
}
