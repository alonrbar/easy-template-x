import * as JSZip from 'jszip';
import { XmlNode, XmlTextNode } from './xmlNode';

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
     * Split the text node into two text nodes, each with it's own wrapping <w:t> node.
     * Returns the newly created text node.
     * 
     * @param textNode 
     * @param splitIndex 
     * @param addBefore Should the new node be added before or after the original node.
     */
    public splitTextNode(textNode: XmlTextNode, splitIndex: number, addBefore: boolean): XmlTextNode {

        let firstXmlTextNode: XmlTextNode;
        let secondXmlTextNode: XmlTextNode;

        // split nodes
        const wordTextNode = this.containingTextNode(textNode);
        const newWordTextNode = XmlNode.cloneNode(wordTextNode, true);
        if (addBefore) {

            // insert new node before existing one
            XmlNode.insertBefore(newWordTextNode, wordTextNode);

            firstXmlTextNode = XmlNode.lastTextChild(newWordTextNode);
            secondXmlTextNode = textNode;

        } else {

            // insert new node after existing one
            const curIndex = wordTextNode.parentNode.childNodes.indexOf(wordTextNode);
            XmlNode.insertChild(wordTextNode.parentNode, newWordTextNode, curIndex + 1);

            firstXmlTextNode = textNode;
            secondXmlTextNode = XmlNode.lastTextChild(newWordTextNode);
        }

        // edit text
        const firstText = firstXmlTextNode.textContent;
        const secondText = secondXmlTextNode.textContent;
        firstXmlTextNode.textContent = firstText.substring(0, splitIndex);
        secondXmlTextNode.textContent = secondText.substring(splitIndex);

        return (addBefore ? firstXmlTextNode : secondXmlTextNode);
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
            throw new Error('Can not join text nodes from separate paragraphs.');

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

                if (curWordTextNode.nodeName !== DocxParser.TEXT_NODE)
                    continue;

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
        firstXmlTextNode.textContent = totalText.join('');
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
     * Search for the first child **Word** text node (i.e. a <w:t> node).
     */
    public firstTextNodeChild(node: XmlNode): XmlNode {

        if (!node)
            return null;

        if (node.nodeName !== DocxParser.RUN_NODE)
            return null;

        if (!node.childNodes)
            return null;

        for (const child of node.childNodes) {
            if (child.nodeName === DocxParser.TEXT_NODE)
                return child;
        }

        return null;
    }

    /**
     * Search **upwards** for the first **Word** text node (i.e. a <w:t> node).
     */
    public containingTextNode(node: XmlTextNode): XmlNode {

        if (!node)
            return null;

        if (!XmlNode.isTextNode(node))
            throw new Error(`'Invalid argument ${nameof(node)}. Expected a XmlTextNode.`);

        let genNode = (node as XmlNode);
        while (genNode.parentNode) {

            if (genNode.nodeName === DocxParser.TEXT_NODE)
                return genNode;

            genNode = genNode.parentNode;
        }

        return null;
    }

    /**
     * Search **upwards** for the first run node.
     */
    public containingRunNode(node: XmlNode): XmlNode {
        if (!node)
            return null;

        if (node.nodeName === DocxParser.RUN_NODE)
            return node;

        return this.containingRunNode(node.parentNode);
    }

    /**
     * Search **upwards** for the first paragraph node.
     */
    public containingParagraphNode(node: XmlNode): XmlNode {
        if (!node)
            return null;

        if (node.nodeName === DocxParser.PARAGRAPH_NODE)
            return node;

        return this.containingParagraphNode(node.parentNode);
    }
}