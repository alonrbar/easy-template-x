import { Tag } from "src/compilation";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office";
import { xml, XmlNode } from "src/xml";
import { LoopOver, LoopTagOptions } from "../loopTagOptions";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopTableRowsStrategy implements ILoopStrategy {

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        const openCell = officeMarkup.query.containingTableCellNode(openTag.xmlTextNode);
        if (!openCell)
            return false;

        const closeCell = officeMarkup.query.containingTableCellNode(closeTag.xmlTextNode);
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

        const firstRow = officeMarkup.query.containingTableRowNode(openTag.xmlTextNode);
        const lastRow = officeMarkup.query.containingTableRowNode(closeTag.xmlTextNode);

        const firstTable = officeMarkup.query.containingTableNode(firstRow);
        const lastTable = officeMarkup.query.containingTableNode(lastRow);
        if (firstTable !== lastTable) {
            throw new TemplateSyntaxError(`Open and close tags are not in the same table: ${openTag.rawText} and ${closeTag.rawText}. Are you trying to repeat rows across adjacent or nested tables?`);
        }

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

        let insertAfter = lastRow;
        for (const curRowsGroup of rowGroups) {
            for (const row of curRowsGroup) {
                xml.modify.insertAfter(row, insertAfter);
                insertAfter = row;
            }
        }

        // Remove old rows - between first and last row
        xml.modify.removeSiblings(firstRow, lastRow);

        // Remove old rows - first and last rows
        xml.modify.remove(firstRow);
        if (firstRow !== lastRow) {
            xml.modify.remove(lastRow);
        }
    }
}
