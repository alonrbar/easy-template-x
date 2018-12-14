import { ScopeData, Tag, TagDisposition, TagPrefix, TemplateContext } from '../compilation';
import { DocxParser } from '../docxParser';
import { last } from '../utils';
import { XmlNode } from '../xmlNode';
import { ILoopHelper, LoopParagraphHelper, LoopTableHelper } from './loop';
import { PluginUtilities, TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly prefixes: TagPrefix[] = [
        {
            prefix: '#',
            tagType: 'loop',
            tagDisposition: TagDisposition.Open
        },
        {
            prefix: '/',
            tagType: 'loop',
            tagDisposition: TagDisposition.Close
        }
    ];

    private readonly loopParagraph = new LoopParagraphHelper();
    private readonly loopTable = new LoopTableHelper();

    public setUtilities(utilities: PluginUtilities) {
        this.utilities = utilities;
        this.loopParagraph.setUtilities(utilities);
        this.loopTable.setUtilities(utilities);
    }

    public containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {

        let value: any[] = data.getScopeData();

        if (!value || !Array.isArray(value) || !value.length)
            value = [];

        // vars
        const openTag = tags[0];
        const closeTag = last(tags);
        const firstParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);

        // select the suitable helper
        let loopHelper: ILoopHelper;
        if (firstParagraph.parentNode && firstParagraph.parentNode.nodeName === DocxParser.TABLE_CELL_NODE) {
            loopHelper = this.loopTable;
        } else {
            loopHelper = this.loopParagraph;
        }

        // prepare to loop
        const { firstNode, nodesToRepeat, lastNode } = loopHelper.splitBefore(openTag, closeTag);

        // repeat (loop) the content
        const repeatedNodes = this.repeat(nodesToRepeat, value.length);

        // recursive compilation 
        // (this step can be optimized in the future if we'll keep track of the
        // path to each token and use that to create new tokens instead of
        // search through the text again)
        const compiledNodes = this.compile(repeatedNodes, data, context);

        // merge back to the document
        loopHelper.mergeBack(compiledNodes, firstNode, lastNode);
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
}