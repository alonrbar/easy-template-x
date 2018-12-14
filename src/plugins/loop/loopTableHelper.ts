import { Tag } from '../../compilation';
import { XmlNode } from '../../xmlNode';
import { PluginUtilities } from '../templatePlugin';
import { ILoopHelper, SplitBeforeResult } from './iLoopHelper';

export class LoopTableHelper implements ILoopHelper {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities) {
        this.utilities = utilities;
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