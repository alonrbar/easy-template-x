import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { last, pushMany } from '../utils';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    private readonly xmlParser = new XmlParser();
    private readonly docxParser = new DocxParser();

    /**
     * @inheritDoc
     */
    public containerTagReplacements(openTagIndex: number, closeTagIndex: number, allTags: Tag[], data: any): void {

        if (!data || !Array.isArray(data) || !data.length)
            data = [];

        const openTag = allTags[openTagIndex];
        const closeTag = allTags[closeTagIndex];

        // get edge paragraphs
        const firstParagraph = this.docxParser.findParagraphNode(openTag.xmlNode);
        const lastParagraph = this.docxParser.findParagraphNode(closeTag.xmlNode);

        // extract relevant content
        const extractedParagraphs = this.extractParagraphs(firstParagraph, openTag.xmlNode, lastParagraph, closeTag.xmlNode);

        // repeat (loop) the content
        const repeatedParagraphs = this.repeatParagraphs(extractedParagraphs, data.length);

        // recursive compilation
        const compiledParagraphs = this.compile(repeatedParagraphs, data);

        // merge back to the document
        this.mergeBack(compiledParagraphs, firstParagraph, lastParagraph);

        // modify input tags collection
        allTags.splice(openTagIndex, closeTagIndex);

        // TODO: adjust compiler accordingly
    }

    private extractParagraphs(firstParagraph: Node, openTagNode: Node, lastParagraph: Node, closeTagNode: Node): Node[] {

        // split edge paragraphs
        const firstParagraphSplit = this.xmlParser.splitByChild(firstParagraph, openTagNode);
        const lastParagraphSplit = this.xmlParser.splitByChild(lastParagraph, closeTagNode);

        // extract all paragraphs in between
        const middleParagraphNodes = this.xmlParser.removeSiblings(firstParagraph, lastParagraph);

        // return joined result
        return [firstParagraphSplit].concat(middleParagraphNodes).concat(lastParagraphSplit);

    }

    private repeatParagraphs(paragraphs: Node[], times: number): Node[] {
        const result: Node[] = [];

        const firstParagraph = paragraphs[0];

        for (let i = 0; i < times; i++) {

            // merge first paragraph to previous one
            if (result.length) {
                this.docxParser.joinParagraphs(last(result), firstParagraph.cloneNode());
            }

            // append other paragraphs
            const newParagraphs = paragraphs.slice(1).map(para => para.cloneNode());
            pushMany(result, newParagraphs);
        }

        return result;
    }

    private compile(nodes: Node[], data: any): Node[] {

        // create dummy root node
        const dummyRootNode = this.xmlParser.parse('<dummyRootNode/>');
        const dummyDocRoot = dummyRootNode.documentElement;
        nodes.forEach(p => dummyDocRoot.appendChild(p));

        // compile the new root
        this.compiler.compile(dummyRootNode, data);

        // return result nodes
        const resultNodes: Node[] = [];
        while (dummyDocRoot.childNodes && dummyDocRoot.childNodes.length) {
            const child = dummyDocRoot.firstChild;
            dummyDocRoot.removeChild(child);
            resultNodes.push(child);
        }
        return resultNodes;
    }

    private mergeBack(newParagraphs: Node[], firstParagraph: Node, lastParagraph: Node): void {

        // merge edge paragraphs
        this.docxParser.joinParagraphs(firstParagraph, newParagraphs[0]);
        this.docxParser.joinParagraphs(newParagraphs[newParagraphs.length - 1], lastParagraph);

        // add middle and last paragraphs to the original document
        for (let i = 1; i < newParagraphs.length; i++) {
            lastParagraph.parentNode.insertBefore(newParagraphs[i], lastParagraph);
        }

        // remove the old last paragraph (was merged into the new one)
        lastParagraph.parentNode.removeChild(lastParagraph);
    }
}