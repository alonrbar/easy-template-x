import { Tag } from "src/compilation";
import { wml } from "src/office";
import { PluginUtilities } from "src/plugins/templatePlugin";
import { XmlNode } from "src/xml";
import { LoopOver, LoopTagOptions } from "../loopTagOptions";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopTableRowsStrategy implements ILoopStrategy {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
    }

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        const openCell = wml.query.containingTableCellNode(openTag.xmlTextNode);
        if (!openCell)
            return false;

        const closeCell = wml.query.containingTableCellNode(closeTag.xmlTextNode);
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

        const firstRow = wml.query.containingTableRowNode(openTag.xmlTextNode);
        const lastRow = wml.query.containingTableRowNode(closeTag.xmlTextNode);
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
