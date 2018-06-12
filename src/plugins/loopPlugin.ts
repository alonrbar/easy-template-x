import { ScopeData, Tag, TagDisposition, TagPrefix, TemplateContext } from '../compilation';
import { last } from '../utils';
import { XmlNode } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

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

    /**
     * @inheritDoc
     */
    public containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {

        let value: any[] = data.getScopeData();

        if (!value || !Array.isArray(value) || !value.length)
            value = [];

        // vars
        const openTag = tags[0];
        const closeTag = last(tags);
        let firstNode = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
        let lastNode = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);
        let middleNodes: XmlNode[];
        const sameNodes = (firstNode === lastNode);

        // extract relevant content        
        const result = this.splitParagraphs(openTag.xmlTextNode, closeTag.xmlTextNode);
        firstNode = result.firstParagraph;
        lastNode = result.lastParagraph;
        middleNodes = result.middleParagraphs;

        // repeat (loop) the content
        const repeatedNodes = this.repeat(middleNodes, value.length);

        // recursive compilation 
        // (this step can be optimized in the future if we'll keep track of the
        // path to each token and use that to create new tokens instead of
        // search through the text again)
        const compiledNodes = this.compile(repeatedNodes, data, context);

        // merge back to the document
        this.mergeBack(compiledNodes, firstNode, lastNode, sameNodes);
    }

    private splitParagraphs(openTagNode: XmlNode, closeTagNode: XmlNode): ExtractParagraphsResult {

        // gather some info
        let firstParagraph = this.utilities.docxParser.containingParagraphNode(openTagNode);
        let lastParagraph = this.utilities.docxParser.containingParagraphNode(closeTagNode);
        const areSame = (firstParagraph === lastParagraph);
        const parent = firstParagraph.parentNode;
        const firstParagraphIndex = parent.childNodes.indexOf(firstParagraph);
        const lastParagraphIndex = areSame ? firstParagraphIndex : parent.childNodes.indexOf(lastParagraph);

        // split first paragraphs
        let splitResult = XmlNode.splitByChild(firstParagraph, openTagNode, true);
        firstParagraph = splitResult[0];
        const firstParagraphSplit = splitResult[1];
        if (areSame)
            lastParagraph = firstParagraphSplit;

        // split last paragraph
        splitResult = XmlNode.splitByChild(lastParagraph, closeTagNode, true);
        const lastParagraphSplit = splitResult[0];
        lastParagraph = splitResult[1];

        // fix references
        XmlNode.removeChild(parent, firstParagraphIndex + 1);
        if (!areSame)
            XmlNode.removeChild(parent, lastParagraphIndex);
        firstParagraphSplit.parentNode = null;
        lastParagraphSplit.parentNode = null;

        // extract all paragraphs in between
        let middleParagraphs: XmlNode[];
        if (areSame) {
            this.utilities.docxParser.joinParagraphs(firstParagraphSplit, lastParagraphSplit);
            middleParagraphs = [firstParagraphSplit];
        } else {
            const inBetween = XmlNode.removeSiblings(firstParagraph, lastParagraph);
            middleParagraphs = [firstParagraphSplit].concat(inBetween).concat(lastParagraphSplit);
        }

        return {
            firstParagraph,
            middleParagraphs,
            lastParagraph
        };
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

    private mergeBack(nodeGroups: XmlNode[][], firstParagraph: XmlNode, lastParagraph: XmlNode, sameNodes: boolean): void {

        let mergeTo = firstParagraph;
        for (const curNodeGroup of nodeGroups) {

            // merge first paragraphs
            this.utilities.docxParser.joinParagraphs(mergeTo, curNodeGroup[0]);

            // add middle and last paragraphs to the original document
            for (let i = 1; i < curNodeGroup.length; i++) {
                XmlNode.insertBefore(curNodeGroup[i], lastParagraph);
                mergeTo = curNodeGroup[i];
            }
        }

        // merge last paragraph
        this.utilities.docxParser.joinParagraphs(mergeTo, lastParagraph);

        // remove the old last paragraph (was merged into the new one)
        XmlNode.remove(lastParagraph);
    }
}

interface ExtractParagraphsResult {
    firstParagraph: XmlNode;
    middleParagraphs: XmlNode[];
    lastParagraph: XmlNode;
}