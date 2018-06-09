import * as JSZip from 'jszip';
import { XmlGeneralNode, XmlNode, XmlTextNode } from './xmlNode';

export class DocxParser {

    public static readonly PARAGRAPH_NODE = 'w:p';
    public static readonly RUN_NODE = 'w:r';
    public static readonly TEXT_NODE = 'w:t';

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

    public contentFilePaths(zip: JSZip) {
        const baseTags = [
            // "docProps/core.xml",
            // "docProps/app.xml",
            "word/document.xml",
            "word/document2.xml"
        ];

        const headersAndFooters = zip
            .file(/word\/(header|footer)\d+\.xml/)
            .map(file => file.name);

        return headersAndFooters.concat(baseTags);
    }

    public mainFilePath(zip: JSZip): string {
        if (zip.files["word/document.xml"]) {
            return "word/document.xml";
        }
        if (zip.files["word/document2.xml"]) {
            return "word/document2.xml";
        }
        return undefined;
    }

    /**
     * Split the text node into two text nodes, each in it's own wrapping <w:t> node.
     * Returns the newly created text node.
     * 
     * @param textNode 
     * @param splitIndex 
     * @param addBefore Should the new node be added before or after the original node.
     */
    public splitTextNode(textNode: XmlTextNode, splitIndex: number, addBefore: boolean): XmlTextNode {

        let firstTextNode: XmlTextNode;
        let secondTextNode: XmlTextNode;

        // split nodes
        const runNode = this.findRunNode(textNode);
        const newRunNode = XmlNode.cloneNode(runNode, true);
        if (addBefore) {

            // insert new run before existing one
            XmlNode.insertBefore(newRunNode, runNode);

            firstTextNode = XmlNode.lastTextChild(this.findTextNode(newRunNode));
            secondTextNode = XmlNode.lastTextChild(textNode);

        } else {

            // insert new run after existing one
            const runIndex = runNode.parentNode.childNodes.indexOf(runNode);
            XmlNode.insertChild(runNode.parentNode, newRunNode, runIndex + 1);

            firstTextNode = XmlNode.lastTextChild(textNode);
            secondTextNode = XmlNode.lastTextChild(this.findTextNode(newRunNode));
        }

        // edit text
        const firstText = firstTextNode.textContent;
        const secondText = secondTextNode.textContent;
        firstTextNode.textContent = firstText.substring(0, splitIndex);
        secondTextNode.textContent = secondText.substring(splitIndex);

        return (addBefore ? firstTextNode : secondTextNode);
    }

    /**
     * Move all text from 'second' to 'first'.
     */
    public joinTextNodes(first: XmlNode, second: XmlNode): void {
        const firstRunNode = this.findRunNode(first);
        const secondRunNode = this.findRunNode(second);

        const paragraphNode = firstRunNode.parentNode;
        if (secondRunNode.parentNode !== paragraphNode)
            throw new Error('Can not join text nodes from separate paragraphs.');

        const firstWordTextNode = this.findTextNode(firstRunNode);
        const firstXmlTextNode = XmlNode.lastTextChild(firstWordTextNode);

        let curRunNode = firstRunNode.nextSibling;
        while (curRunNode) {

            // move text to first node
            const curWordTextNode = this.findTextNode(curRunNode);
            if (curWordTextNode) {
                const curXmlTextNode = XmlNode.lastTextChild(curWordTextNode);
                firstXmlTextNode.textContent += curXmlTextNode.textContent;
            }

            // go next
            const toRemove = curRunNode;
            if (curRunNode === secondRunNode) {
                curRunNode = null;
            } else {
                curRunNode = curRunNode.nextSibling;
            }

            // remove current node
            XmlNode.remove(toRemove);            
        }
    }

    /**
     * Take all runs from 'second' and move them to 'first'.
     */
    public joinParagraphs(first: XmlNode, second: XmlNode): void {
        let childIndex = 0;
        while (second.childNodes && second.childNodes.length) {
            const curChild = second.childNodes[childIndex];
            if (curChild.nodeName === DocxParser.RUN_NODE) {
                XmlNode.removeChild(second, childIndex);
                XmlNode.appendChild(first, curChild);
            } else {
                childIndex++;
            }
        }
    }

    /**
     * Search **downwards** for the first **Word** text node (i.e. a <w:t> node).
     */
    public findTextNode(node: XmlNode): XmlGeneralNode {

        if (!node)
            return null;

        if (XmlNode.isTextNode(node))
            return null;

        if (node.nodeName === DocxParser.TEXT_NODE)
            return node;

        if (!node.childNodes)
            return null;

        for (const child of node.childNodes) {
            const textNode = this.findTextNode(child);
            if (textNode)
                return textNode;
        }

        return null;
    }

    /**
     * Search **upwards** for the first run node.
     */
    public findRunNode(node: XmlNode): XmlNode {
        if (!node)
            return null;

        if (node.nodeName === DocxParser.RUN_NODE)
            return node;

        return this.findRunNode(node.parentNode);
    }

    /**
     * Search **upwards** for the first paragraph node.
     */
    public findParagraphNode(node: XmlNode): XmlNode {
        if (!node)
            return null;

        if (node.nodeName === DocxParser.PARAGRAPH_NODE)
            return node;

        return this.findParagraphNode(node.parentNode);
    }
}