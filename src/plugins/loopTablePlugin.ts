import { ScopeData, Tag, TagDisposition, TagPrefix, TemplateContext } from '../compilation';
import { last } from '../utils';
import { XmlNode } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

export class LoopTablePlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [
        {
            prefix: '#',
            tagType: 'loop-table',
            tagDisposition: TagDisposition.Open
        },
        {
            prefix: '/',
            tagType: 'loop-table',
            tagDisposition: TagDisposition.Close
        }
    ];

    public containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {

        let value: any[] = data.getScopeData();

        if (!value || !Array.isArray(value) || !value.length)
            value = [];

        // vars
        const openTag = tags[0];
        const closeTag = last(tags);
        let firstRow = this.utilities.docxParser.containingTableRowNode(openTag.xmlTextNode);
        let lastRow = this.utilities.docxParser.containingTableRowNode(closeTag.xmlTextNode);
        const rowsToRepeat = XmlNode.siblingsInRange(firstRow, lastRow);

        // repeat (loop) the content
        const repeatedNodes = this.repeat(rowsToRepeat, value.length);

        // recursive compilation 
        // (this step can be optimized in the future if we'll keep track of the
        // path to each token and use that to create new tokens instead of
        // search through the text again)
        const compiledNodes = repeatedNodes; // this.compile(repeatedNodes, data, context);

        // merge back to the document
        this.mergeBack(compiledNodes, firstRow, lastRow);
    }

    private repeat(nodes: XmlNode[], times: number): XmlNode[][] {
        if (!nodes.length || !times)
            return [];

        const allResults: XmlNode[][] = [];

        for (let i = 0; i < times; i++) {
            const curResult = nodes.map(node => XmlNode.cloneNode(node, true));
            allResults.push(curResult);
        }

        return allResults;
    }

    private compile(nodeGroups: XmlNode[][], data: ScopeData, context: TemplateContext): XmlNode[][] {
        const compiledNodeGroups: XmlNode[][] = [];

        // compile each node group with it's relevant data
        for (let i = 0; i < nodeGroups.length; i++) {

            // create dummy root node
            const curNodes = nodeGroups[i];
            const dummyRootNode = XmlNode.createGeneralNode('dummyRootNode');
            curNodes.forEach(node => XmlNode.appendChild(dummyRootNode, node));

            // compile the new root
            data.path.push(i);
            this.utilities.compiler.compile(dummyRootNode, data, context);
            data.path.pop();

            // disconnect from dummy root
            const curResult: XmlNode[] = [];
            while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
                const child = XmlNode.removeChild(dummyRootNode, 0);
                curResult.push(child);
            }
            compiledNodeGroups.push(curResult);
        }

        return compiledNodeGroups;
    }

    private mergeBack(rowGroups: XmlNode[][], firstRow: XmlNode, lastRow: XmlNode): void {

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