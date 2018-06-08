import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { last, pushMany } from '../utils';
import { XmlGeneralNode, XmlNode, XmlNodeType } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    private readonly docxParser = new DocxParser();

    /**
     * @inheritDoc
     */
    public containerTagReplacements(openTagIndex: number, closeTagIndex: number, allTags: Tag[], data: any): boolean {

        if (!data || !Array.isArray(data) || !data.length)
            data = [];

        const openTag = allTags[openTagIndex];
        const closeTag = allTags[closeTagIndex];

        // get edge paragraphs
        const firstParagraph = this.docxParser.findParagraphNode(openTag.xmlTextNode);
        const lastParagraph = this.docxParser.findParagraphNode(closeTag.xmlTextNode);

        // extract relevant content
        const extractedParagraphs = this.extractParagraphs(firstParagraph, openTag.xmlTextNode, lastParagraph, closeTag.xmlTextNode);

        // repeat (loop) the content
        const repeatedParagraphs = this.repeatParagraphs(extractedParagraphs, data.length);

        // recursive compilation
        const compiledParagraphs = this.compile(repeatedParagraphs, data);

        // merge back to the document
        this.mergeBack(compiledParagraphs, firstParagraph, lastParagraph);

        // modify input tags collection
        allTags.splice(openTagIndex, closeTagIndex + 1);

        return true;
    }

    private extractParagraphs(firstParagraph: XmlNode, openTagNode: XmlNode, lastParagraph: XmlNode, closeTagNode: XmlNode): XmlNode[] {

        // split edge paragraphs
        const firstParagraphSplit = XmlNode.splitByChild(firstParagraph, openTagNode, true, true);
        const lastParagraphSplit = XmlNode.splitByChild(lastParagraph, closeTagNode, false, true);

        // extract all paragraphs in between
        const middleParagraphNodes = XmlNode.removeSiblings(firstParagraph, lastParagraph);

        // return joined result
        return [firstParagraphSplit].concat(middleParagraphNodes).concat(lastParagraphSplit);

    }

    private repeatParagraphs(paragraphs: XmlNode[], times: number): XmlNode[] {
        const result: XmlNode[] = [];

        const firstParagraph = paragraphs[0];

        for (let i = 0; i < times; i++) {

            // merge first paragraph to previous one
            if (result.length) {
                this.docxParser.joinParagraphs(last(result), XmlNode.cloneNode(firstParagraph, true));
            } else {
                result.push(XmlNode.cloneNode(firstParagraph, true));
            }

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