import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { last, pushMany } from '../utils';
import { XmlNode } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    private readonly docxParser = new DocxParser();

    /**
     * @inheritDoc
     */
    public containerTagReplacements(tags: Tag[], data: any): void {

        if (!data || !Array.isArray(data) || !data.length)
            data = [];

        const openTag = tags[0];
        const closeTag = last(tags);

        // extract relevant content
        const { firstParagraph, middleParagraphs, lastParagraph } = this.splitParagraphs(openTag.xmlTextNode, closeTag.xmlTextNode);

        // repeat (loop) the content
        const repeatedParagraphs = this.repeatParagraphs(middleParagraphs, data.length);

        // recursive compilation 
        // (this step can be optimized in the future if we'll keep track of the
        // path to each delimiter and use that to create new DelimiterMarks
        // instead of search through the text again)
        const compiledParagraphs = this.compile(repeatedParagraphs, data);

        // merge back to the document
        this.mergeBack(compiledParagraphs, firstParagraph, lastParagraph);
    }

    private splitParagraphs(openTagNode: XmlNode, closeTagNode: XmlNode): ExtractParagraphsResult {

        // gather some info
        let firstParagraph = this.docxParser.containingParagraphNode(openTagNode);
        let lastParagraph = this.docxParser.containingParagraphNode(closeTagNode);
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
            this.docxParser.joinParagraphs(firstParagraphSplit, lastParagraphSplit);
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

    private repeatParagraphs(paragraphs: XmlNode[], times: number): XmlNode[] {
        if (!paragraphs.length || !times)
            return [];

        const firstParagraph = paragraphs[0];
        const result = [XmlNode.cloneNode(firstParagraph, true)];

        for (let i = 0; i < times; i++) {

            // merge first paragraph to previous one
            if (i !== 0)
                this.docxParser.joinParagraphs(last(result), XmlNode.cloneNode(firstParagraph, true));

            // append other paragraphs
            const newParagraphs = paragraphs.slice(1).map(para => XmlNode.cloneNode(para, true));
            pushMany(result, newParagraphs);
        }

        return result;
    }

    private compile(nodes: XmlNode[], data: any): XmlNode[] {

        // create dummy root node
        const dummyRootNode = XmlNode.createGeneralNode('dummyRootNode');
        nodes.forEach(p => XmlNode.appendChild(dummyRootNode, p));

        // compile the new root
        this.compiler.compile(dummyRootNode, data);

        // return result nodes
        const resultNodes: XmlNode[] = [];
        while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
            const child = dummyRootNode.childNodes[0];
            XmlNode.remove(child);
            resultNodes.push(child);
        }
        return resultNodes;
    }

    private mergeBack(newParagraphs: XmlNode[], firstParagraph: XmlNode, lastParagraph: XmlNode): void {
        if (!newParagraphs.length)
            return;

        // merge edge paragraphs
        this.docxParser.joinParagraphs(firstParagraph, newParagraphs[0]);
        this.docxParser.joinParagraphs(newParagraphs[newParagraphs.length - 1], lastParagraph);

        // add middle and last paragraphs to the original document
        for (let i = 1; i < newParagraphs.length; i++) {
            XmlNode.insertBefore(newParagraphs[i], lastParagraph);
        }

        // remove the old last paragraph (was merged into the new one)
        XmlNode.remove(lastParagraph);
    }
}

interface ExtractParagraphsResult {
    firstParagraph: XmlNode;
    middleParagraphs: XmlNode[];
    lastParagraph: XmlNode;
}