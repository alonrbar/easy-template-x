import { Tag, TagType } from '../compilation/tag';
import { DocxParser } from '../docxParser';
import { last } from '../utils';
import { TemplatePlugin } from './templatePlugin';

export class LoopPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Loop;

    private readonly docxParser = new DocxParser();

    /**
     * @inheritDoc
     */
    public containerTagReplacements(openTagIndex: number, closeTagIndex: number, allTags: Tag[], data: any): void {

        if (!data || !Array.isArray(data) || !data.length)
            data = [];

        const openTag = allTags[openTagIndex];
        const closeTag = allTags[closeTagIndex];

        // clone all paragraphs in range
        const paragraphClones = this.cloneParagraphs(openTag, closeTag, data.length);

        // create dummy root node
        const dummyRootNode = new Node();
        paragraphClones.forEach(p => dummyRootNode.appendChild(p));
        
        // compile the new root
        this.compiler.compile(dummyRootNode, data);

        // modify tags collection
        allTags.splice(openTagIndex, closeTagIndex);

        // 1. re-merge first paragraphs
        // 2. re-merge last paragraph

        // adjust compiler accordingly
    }

    public clearSubNodes(path: number[], node: Node): void {
        throw new Error("Method not implemented.");
    }

    private cloneParagraphs(openTag: Tag, closeTag: Tag, times: number): Node[] {

        // get first paragraph
        const openTagPathInFirstParagraph: number[] = [];
        const firstParagraph = this.docxParser.findParagraphNode(openTag.xmlNode);

        // get last paragraph        
        const closeTagPathInLastParagraph: number[] = [];
        const lastParagraph = this.docxParser.findParagraphNode(closeTag.xmlNode);

        // clone paragraphs, from first to last
        const paragraphClones: Node[] = [];

        let paragraph = firstParagraph;
        while (paragraph !== lastParagraph) {
            paragraphClones.push(paragraph.cloneNode());
            paragraph = paragraph.nextSibling;
        }
        paragraphClones.push(lastParagraph.cloneNode());

        // remove unnecessary parts - from first paragraph
        this.clearSubNodes(openTagPathInFirstParagraph, paragraphClones[0]);
        this.clearSubNodes(openTagPathInFirstParagraph, firstParagraph);

        // remove unnecessary parts - from last paragraph
        this.clearSubNodes(closeTagPathInLastParagraph, last(paragraphClones));
        this.clearSubNodes(closeTagPathInLastParagraph, lastParagraph);

        // 1. re-merge first paragraphs
        // 2. insert middle paragraphs
        // 3. if (last iteration)
        //      re-merge last paragraph
        //    else
        //      merge last clone with next first clone and go to (2)

        return paragraphClones;
    }
}