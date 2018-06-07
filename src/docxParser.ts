import * as JSZip from 'jszip';
import { XmlParser } from './xmlParser';

export class DocxParser {
    
    public readonly xmlParser = new XmlParser();

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

    public splitTextNode(textNode: Node, splitIndex: number, addBefore: boolean): void {

        let firstTextNode: Node;
        let secondTextNode: Node;

        // split nodes
        const runNode = this.findRunNode(textNode);
        if (addBefore) {

            const beforeRunNode = runNode.cloneNode(true);
            runNode.parentNode.insertBefore(beforeRunNode, runNode);

            firstTextNode = this.findTextNode(beforeRunNode);
            secondTextNode = textNode;

        } else {

            const afterRunNode = runNode.cloneNode(true);
            const runIndex = this.xmlParser.indexOfChildNode(runNode.parentNode, runNode);
            if (runIndex === runNode.parentNode.childNodes.length - 1) {
                runNode.parentNode.appendChild(afterRunNode);
            } else {
                const currentAfterRunNode = runNode.parentNode.childNodes.item(runIndex + 1);
                runNode.parentNode.insertBefore(currentAfterRunNode, afterRunNode);
            }

            firstTextNode = textNode;
            secondTextNode = this.findTextNode(afterRunNode);
        }

        // edit text
        firstTextNode.textContent = firstTextNode.textContent.substring(0, splitIndex);
        secondTextNode.textContent = secondTextNode.textContent.substring(splitIndex);
    }

    public joinTextNodes(first: Node, second: Node): void {
        const firstRunNode = this.findRunNode(first);
        const secondRunNode = this.findRunNode(second);

        const paragraphNode = firstRunNode.parentNode;
        if (secondRunNode.parentNode !== paragraphNode)
            throw new Error('Can not join text nodes from separate paragraphs.');

        let curRunNode = firstRunNode.nextSibling;
        while (curRunNode) {

            // move text to first node
            const curTextNode = this.findTextNode(curRunNode);
            if (curTextNode)
                first.textContent += curTextNode.textContent;

            // remove current node
            curRunNode.parentNode.removeChild(curRunNode);

            // go next
            if (curRunNode === secondRunNode) {
                curRunNode = null;
            } else {
                curRunNode = curRunNode.nextSibling;
            }
        }
    }

    /**
     * Search **downwards** for the first text node.
     */
    public findTextNode(node: Node): Node {

        if (!node)
            return null;

        if (node.nodeName === 'w:t')
            return node;

        if (!node.hasChildNodes())
            return null;

        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes.item(i);
            const textNode = this.findTextNode(childNode);
            if (textNode)
                return textNode;
        }

        return null;
    }

    /**
     * Search **upwards** for the first run node.
     */
    public findRunNode(node: Node): Node {
        if (!node)
            return null;

        if (node.nodeName === 'w:r')
            return node;

        return this.findRunNode(node.parentNode);
    }

    /**
     * Search **upwards** for the first paragraph node.
     */
    public findParagraphNode(node: Node): Node {
        if (!node)
            return null;

        if (node.nodeName === 'w:p')
            return node;

        return this.findParagraphNode(node.parentNode);
    }
}