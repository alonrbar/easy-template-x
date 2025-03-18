import { Tag } from "src/compilation";
import { oml } from "src/office";
import { LoopOver, LoopTagOptions } from "src/plugins/loop/loopTagOptions";
import { xml, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopTableColumnsStrategy implements ILoopStrategy {

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        const openCell = oml.query.containingTableCellNode(openTag.xmlTextNode);
        if (!openCell)
            return false;

        const closeCell = oml.query.containingTableCellNode(closeTag.xmlTextNode);
        if (!closeCell)
            return false;

        const options = openTag.options as LoopTagOptions;
        const forceColumnLoop = options?.loopOver === LoopOver.Column;

        // If both tags are in the same cell, assume it's a paragraph loop (iterate content, not columns).
        if (!forceColumnLoop && openCell === closeCell)
            return false;

        const openTable = oml.query.containingTableNode(openCell);
        if (!openTable)
            return false;

        const closeTable = oml.query.containingTableNode(closeCell);
        if (!closeTable)
            return false;

        // If the tags are in different tables, don't apply this strategy.
        if (openTable !== closeTable)
            return false;

        const openRow = oml.query.containingTableRowNode(openCell);
        if (!openRow)
            return false;

        const closeRow = oml.query.containingTableRowNode(closeCell);
        if (!closeRow)
            return false;

        const openColumnIndex = openRow.childNodes?.findIndex(child => child === openCell);
        if (openColumnIndex === -1)
            return false;

        const closeColumnIndex = closeRow.childNodes?.findIndex(child => child === closeCell);
        if (closeColumnIndex === -1)
            return false;

        // If the tags are in different columns, assume it's a table rows loop (iterate rows, not columns).
        if (!forceColumnLoop && openColumnIndex !== closeColumnIndex)
            return false;

        return true;
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        const firstCell = oml.query.containingTableCellNode(openTag.xmlTextNode);
        const lastCell = oml.query.containingTableCellNode(closeTag.xmlTextNode);

        const firstRow = oml.query.containingTableRowNode(firstCell);
        const lastRow = oml.query.containingTableRowNode(lastCell);

        const firstColumnIndex = firstRow.childNodes?.findIndex(child => child === firstCell);
        const lastColumnIndex = lastRow.childNodes?.findIndex(child => child === lastCell);

        const table = oml.query.containingTableNode(firstCell);

        // Remove the loop tags
        xml.modify.remove(openTag.xmlTextNode);
        xml.modify.remove(closeTag.xmlTextNode);

        // Extract the columns to repeat.
        // This is a single synthetic table with the columns to repeat.
        const columnsWrapper = this.extractColumns(table, firstColumnIndex, lastColumnIndex);

        return {
            firstNode: firstCell,
            nodesToRepeat: [columnsWrapper],
            lastNode: lastCell
        };
    }

    public mergeBack(columnsWrapperGroups: XmlNode[][], firstCell: XmlNode, lastCell: XmlNode): void {

        const table = oml.query.containingTableNode(firstCell);
        const firstRow = oml.query.containingTableRowNode(firstCell);
        const firstColumnIndex = firstRow.childNodes?.findIndex(child => child === firstCell);

        const lastRow = oml.query.containingTableRowNode(lastCell);
        const lastColumnIndex = lastRow.childNodes?.findIndex(child => child === lastCell);

        let index = firstColumnIndex + 1;
        for (const colWrapperGroup of columnsWrapperGroups) {
            if (colWrapperGroup.length !== 1) {
                throw new Error('Expected a single synthetic table as the columns wrapper.');
            }

            const colWrapper = colWrapperGroup[0];
            this.insertColumnAtIndex(table, colWrapper, index);
            index++;
        }

        // Remove the old columns
        this.removeColumn(table, firstColumnIndex);
        if (firstColumnIndex !== lastColumnIndex) {
            this.removeColumn(table, lastColumnIndex + index);
        }
    }

    private extractColumns(table: XmlNode, firstColumnIndex: number, lastColumnIndex: number): XmlNode {
        // Create a synthetic table to hold the columns
        const syntheticTable = xml.create.generalNode('w:tbl');

        // For each row in the original table
        const rows = table.childNodes?.filter(node => node.nodeName === 'w:tr') || [];
        for (const row of rows) {
            const newRow = xml.create.cloneNode(row, false);
            const cells = row.childNodes?.filter(node => node.nodeName === 'w:tc') || [];

            // Copy only the cells within our column range
            for (let i = firstColumnIndex; i <= lastColumnIndex; i++) {
                if (cells[i]) {
                    xml.modify.appendChild(newRow, xml.create.cloneNode(cells[i], true));
                }
            }

            xml.modify.appendChild(syntheticTable, newRow);
        }

        return syntheticTable;
    }

    private insertColumnAtIndex(table: XmlNode, column: XmlNode, index: number): void {
        // Get all rows from both tables
        const sourceRows = column.childNodes?.filter(node => node.nodeName === 'w:tr') || [];
        const targetRows = table.childNodes?.filter(node => node.nodeName === 'w:tr') || [];

        // Insert columns in the target table
        for (let i = 0; i < targetRows.length; i++) {
            const targetRow = targetRows[i];
            const sourceRow = sourceRows[i];

            if (!sourceRow || !targetRow) {
                continue;
            }

            // We expect exactly one cell per row in the synthetic source table
            const sourceCell = sourceRow.childNodes?.[0];
            if (!sourceCell) {
                throw new Error(`Cell not found in synthetic source table row ${i}.`);
            }

            xml.modify.insertChild(targetRow, xml.create.cloneNode(sourceCell, true), index);
        }
    }

    private removeColumn(table: XmlNode, index: number): void {
        const rows = table.childNodes?.filter(node => node.nodeName === 'w:tr') || [];
        for (const row of rows) {
            if (!row.childNodes) {
                continue;
            }

            if (row.childNodes.length <= index) {
                continue;
            }

            xml.modify.remove(row.childNodes[index]);
        }
    }
}

