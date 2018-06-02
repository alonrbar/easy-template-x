import { TagTree, TagType } from '../compilation';
import { XmlParser } from '../xmlParser';
import { TemplatePlugin } from './templatePlugin';

export class SimpleTagPlugin extends TemplatePlugin {

    public readonly tagType = TagType.Simple;

    /**
     * @inheritDoc
     */
    public doDocumentReplacements(doc: Document, tag: TagTree, data: any): void {

        // TODO: line breaks

        // In Word text nodes are contained in "run" nodes (which specifies text
        // properties such as font and color). The "run" nodes in turn are
        // contained in paragraph nodes which is the core unit of content.
        //
        // Example:
        //
        // <w:p>    <-- paragraph
        //   <w:r>      <-- run
        //     <w:rPr>      <-- run properties
        //       <w:b/>     <-- bold
        //     </w:rPr>
        //     <w:t>This is text.</w:t>     <-- actual text
        //   </w:r>
        // </w:p> 
        //
        // see: http://officeopenxml.com/WPcontentOverview.php

        const tagNode = this.joinTagNodes(tag);
        const value = XmlParser.encode(data);
    }

    private joinTagNodes(tag: TagTree) {
        while (tag.startNode !== tag.endNode) {

        }
    }

    private getRunNode(node: Node) {
        if (node.nodeName === 'w:t') {

        }
    }
}