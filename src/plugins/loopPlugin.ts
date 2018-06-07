import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
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

        // clone and repeat paragraph range
        const repeatedClonedParagraphs = this.splitAndClone(firstParagraph, openTag.xmlNode, lastParagraph, closeTag.xmlNode, data.length);

        // recursive compilation
        const compiledNodes = this.compile(repeatedClonedParagraphs, data);

        // merge back to the document
        this.mergeBack(compiledNodes, firstParagraph, lastParagraph);

        // modify input tags collection
        allTags.splice(openTagIndex, closeTagIndex);

        // TODO: adjust compiler accordingly
    }

    private splitAndClone(firstParagraph: Node, openTagNode: Node, lastParagraph: Node, closeTagNode: Node, times: number): Node[] {

        // split edge paragraphs and prepare for cloning process
        const firstParagraphClone = this.xmlParser.splitByChild(firstParagraph, openTagNode);
        const lastParagraphClone = this.xmlParser.splitByChild(lastParagraph, closeTagNode);

        // clone all paragraphs in between
        const middleParagraphClones = this.xmlParser.cloneSiblings(firstParagraph, lastParagraph);

        // return joined result
        const clonedSection = [firstParagraphClone].concat(middleParagraphClones).concat(lastParagraphClone);
        return this.joinRepeatParagraphs(clonedSection, times);
    }

    private joinRepeatParagraphs(paragraphs: Node[], times: number): Node[] {
        throw new Error('not implemented...');
    }

    private compile(nodes: Node[], data: any): Node[] {

        // create dummy root node
        const dummyRootNode = this.xmlParser.parse('<dummyRootNode/>');
        nodes.forEach(p => dummyRootNode.documentElement.appendChild(p));

        // compile the new root
        this.compiler.compile(dummyRootNode, data);

        // return result nodes
        const newChildNodes = dummyRootNode.documentElement.childNodes;
        if (!newChildNodes || !newChildNodes.length)
            return [];

        const resultNodes: Node[] = [];
        for (let i = 0; i < resultNodes.length; i++) {
            resultNodes.push(newChildNodes.item(i));
        }
        return resultNodes;
    }

    private mergeBack(newParagraphs: Node[], firstParagraph: Node, lastParagraph: Node): void {

        // merge first original paragraph with first resulting paragraph
        this.docxParser.joinParagraphs(firstParagraph, newParagraphs[0]);

        // merge first original paragraph with first resulting paragraph
        this.docxParser.joinParagraphs(newParagraphs[newParagraphs.length - 1], lastParagraph);

        // add middle paragraphs to the original document
        for (let i = 1; i < newParagraphs.length - 1; i++) {
            lastParagraph.parentNode.insertBefore(newParagraphs[i], lastParagraph);
        }
    }
}