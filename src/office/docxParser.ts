import { XmlGeneralNode, XmlNode, XmlParser, XmlTextNode } from "../xml";
import { Zip } from "../zip";
import { Docx } from "./docx";

export class DocxParser {
    /*
     * Word markup intro:
     *
     * In Word text nodes are contained in "run" nodes (which specifies text
     * properties such as font and color). The "run" nodes in turn are
     * contained in paragraph nodes which is the core unit of content.
     *
     * Example:
     *
     * <w:p>    <-- paragraph
     *   <w:r>      <-- run
     *     <w:rPr>      <-- run properties
     *       <w:b/>     <-- bold
     *     </w:rPr>
     *     <w:t>This is text.</w:t>     <-- actual text
     *   </w:r>
     * </w:p>
     *
     * see: http://officeopenxml.com/WPcontentOverview.php
     */

    public static readonly PARAGRAPH_NODE = "w:p";
    public static readonly PARAGRAPH_PROPERTIES_NODE = "w:pPr";
    public static readonly RUN_NODE = "w:r";
    public static readonly RUN_PROPERTIES_NODE = "w:rPr";
    public static readonly STRUCTURED_DOCUMENT_TAG_NODE = "w:sdt";
    public static readonly STRUCTURED_DOCUMENT_TAG_CONTENT_NODE =
    "w:sdtContent";
    public static readonly STRUCTURED_DOCUMENT_TAG_PROPERTIES_NODE = "w:sdtPr";
    public static readonly ID_NODE = "w:id";
    public static readonly VALUE_ATTRIBUTE = "w:val";
    public static readonly TEXT_NODE = "w:t";
    public static readonly TABLE_ROW_NODE = "w:tr";
    public static readonly TABLE_CELL_NODE = "w:tc";
    public static readonly NUMBER_PROPERTIES_NODE = "w:numPr";

    //
    // constructor
    //

    constructor(private readonly xmlParser: XmlParser) {}

    //
    // parse document
    //

    public load(zip: Zip): Docx {
        return new Docx(zip, this.xmlParser);
    }

    //
    // content manipulation
    //

    /**
     * Split the text node into two text nodes, each with it's own wrapping <w:t> node.
     * Returns the newly created text node.
     *
     * @param textNode
     * @param splitIndex
     * @param addBefore Should the new node be added before or after the original node.
     */
    public splitTextNode(
        textNode: XmlTextNode,
        splitIndex: number,
        addBefore: boolean
    ): XmlTextNode {
        let firstXmlTextNode: XmlTextNode;
        let secondXmlTextNode: XmlTextNode;

        // split nodes
        const wordTextNode = this.containingTextNode(textNode);
        const newWordTextNode = XmlNode.cloneNode(wordTextNode, true);

        // set space preserve to prevent display differences after splitting
        // (otherwise if there was a space in the middle of the text node and it
        // is now at the beginning or end of the text node it will be ignored)
        this.setSpacePreserveAttribute(wordTextNode);
        this.setSpacePreserveAttribute(newWordTextNode);

        if (addBefore) {
            // insert new node before existing one
            XmlNode.insertBefore(newWordTextNode, wordTextNode);

            firstXmlTextNode = XmlNode.lastTextChild(newWordTextNode);
            secondXmlTextNode = textNode;
        } else {
            // insert new node after existing one
            const curIndex = wordTextNode.parentNode.childNodes.indexOf(
                wordTextNode
            );
            XmlNode.insertChild(
                wordTextNode.parentNode,
                newWordTextNode,
                curIndex + 1
            );

            firstXmlTextNode = textNode;
            secondXmlTextNode = XmlNode.lastTextChild(newWordTextNode);
        }

        // edit text
        const firstText = firstXmlTextNode.textContent;
        const secondText = secondXmlTextNode.textContent;
        firstXmlTextNode.textContent = firstText.substring(0, splitIndex);
        secondXmlTextNode.textContent = secondText.substring(splitIndex);

        return addBefore ? firstXmlTextNode : secondXmlTextNode;
    }

    /**
     * Move all text between the 'from' and 'to' nodes to the 'from' node.
     */
    public joinTextNodesRange(from: XmlTextNode, to: XmlTextNode): void {
        // find run nodes
        const firstRunNode = this.containingRunNode(from);
        const secondRunNode = this.containingRunNode(to);

        const paragraphNode = firstRunNode.parentNode;
        if (secondRunNode.parentNode !== paragraphNode)
            throw new Error(
                "Can not join text nodes from separate paragraphs."
            );

        // find "word text nodes"
        const firstWordTextNode = this.containingTextNode(from);
        const secondWordTextNode = this.containingTextNode(to);
        const totalText: string[] = [];

        // iterate runs
        let curRunNode = firstRunNode;
        while (curRunNode) {
            // iterate text nodes
            let curWordTextNode: XmlNode;
            if (curRunNode === firstRunNode) {
                curWordTextNode = firstWordTextNode;
            } else {
                curWordTextNode = this.firstTextNodeChild(curRunNode);
            }
            while (curWordTextNode) {
                if (curWordTextNode.nodeName !== DocxParser.TEXT_NODE) continue;

                // move text to first node
                const curXmlTextNode = XmlNode.lastTextChild(curWordTextNode);
                totalText.push(curXmlTextNode.textContent);

                // next text node
                const textToRemove = curWordTextNode;
                if (curWordTextNode === secondWordTextNode) {
                    curWordTextNode = null;
                } else {
                    curWordTextNode = curWordTextNode.nextSibling;
                }

                // remove current text node
                if (textToRemove !== firstWordTextNode) {
                    XmlNode.remove(textToRemove);
                }
            }

            // next run
            const runToRemove = curRunNode;
            if (curRunNode === secondRunNode) {
                curRunNode = null;
            } else {
                curRunNode = curRunNode.nextSibling;
            }

            // remove current run
            if (!runToRemove.childNodes || !runToRemove.childNodes.length) {
                XmlNode.remove(runToRemove);
            }
        }

        // set the text content
        const firstXmlTextNode = XmlNode.lastTextChild(firstWordTextNode);
        firstXmlTextNode.textContent = totalText.join("");
    }

    /**
     * Take all runs from 'second' and move them to 'first'.
     */
    public joinParagraphs(first: XmlNode, second: XmlNode): void {
        if (first === second) return;

        let childIndex = 0;
        while (second.childNodes && childIndex < second.childNodes.length) {
            const curChild = second.childNodes[childIndex];
            if (curChild.nodeName === DocxParser.RUN_NODE) {
                XmlNode.removeChild(second, childIndex);
                XmlNode.appendChild(first, curChild);
            } else {
                childIndex++;
            }
        }
    }

    public setSpacePreserveAttribute(node: XmlGeneralNode): void {
        if (!node.attributes) {
            node.attributes = {};
        }
        if (!node.attributes["xml:space"]) {
            node.attributes["xml:space"] = "preserve";
        }
    }

    //
    // node queries
    //

    public isTextNode(node: XmlNode): boolean {
        return node.nodeName === DocxParser.TEXT_NODE;
    }

    public isStructuredDocumentTagNode(node: XmlNode): boolean {
        return node.nodeName === DocxParser.STRUCTURED_DOCUMENT_TAG_NODE;
    }

    public isTableCellNode(node: XmlNode): boolean {
        return node.nodeName === DocxParser.TABLE_CELL_NODE;
    }

    public isParagraphNode(node: XmlNode): boolean {
        return node.nodeName === DocxParser.PARAGRAPH_NODE;
    }

    public isListParagraph(paragraphNode: XmlNode): boolean {
        const paragraphProperties = this.paragraphPropertiesNode(paragraphNode);
        const listNumberProperties = XmlNode.findChildByName(
            paragraphProperties,
            DocxParser.NUMBER_PROPERTIES_NODE
        );
        return !!listNumberProperties;
    }

    public paragraphPropertiesNode(paragraphNode: XmlNode): XmlNode {
        if (!this.isParagraphNode(paragraphNode))
            throw new Error(
                `Expected paragraph node but received a '${paragraphNode.nodeName}' node.`
            );

        return XmlNode.findChildByName(
            paragraphNode,
            DocxParser.PARAGRAPH_PROPERTIES_NODE
        );
    }

    /**
     * Search for the first direct child **Word** text node (i.e. a <w:t> node).
     */
    public firstTextNodeChild(node: XmlNode): XmlNode {
        if (!node) return null;

        if (node.nodeName !== DocxParser.RUN_NODE) return null;

        if (!node.childNodes) return null;

        for (const child of node.childNodes) {
            if (child.nodeName === DocxParser.TEXT_NODE) return child;
        }

        return null;
    }

    /**
     * Search **upwards** for the first **Word** text node (i.e. a <w:t> node).
     */
    public containingTextNode(node: XmlTextNode): XmlGeneralNode {
        if (!node) return null;

        if (!XmlNode.isTextNode(node))
            throw new Error(
                `'Invalid argument ${nameof(node)}. Expected a XmlTextNode.`
            );

        return XmlNode.findParentByName(
            node,
            DocxParser.TEXT_NODE
        ) as XmlGeneralNode;
    }

    /**
     * Search **upwards** for the first run node.
     */
    public containingRunNode(node: XmlNode): XmlNode {
        return XmlNode.findParentByName(node, DocxParser.RUN_NODE);
    }

    /**
     * Search **upwards** for the first paragraph node.
     */
    public containingParagraphNode(node: XmlNode): XmlNode {
        return XmlNode.findParentByName(node, DocxParser.PARAGRAPH_NODE);
    }

    /**
     * Search **upwards** for the first "table row" node.
     */
    public containingTableRowNode(node: XmlNode): XmlNode {
        return XmlNode.findParentByName(node, DocxParser.TABLE_ROW_NODE);
    }
}
