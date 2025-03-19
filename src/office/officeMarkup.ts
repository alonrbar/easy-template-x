import { xml, XmlGeneralNode, XmlNode, XmlTextNode } from "src/xml";
import { OmlAttribute, OmlNode } from "./omlNode";

//
// Wordprocessing Markup Language (WML) intro:
//
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
//

/**
 * Office Markup Language (OML) utilities.
 *
 * Office Markup Language is my generic term for the markup languages that are
 * used in Office Open XML documents. Including but not limited to
 * Wordprocessing Markup Language, Drawing Markup Language and Spreadsheet
 * Markup Language.
 */
export class OfficeMarkup {

    /**
     * Office Markup query utilities.
     */
    public readonly query = new Query();

    /**
     * Office Markup modify utilities.
     */
    public readonly modify = new Modify();
}

/**
 * Wordprocessing Markup Language (WML) query utilities.
 */
class Query {

    public isTextNode(node: XmlNode): boolean {
        return node.nodeName === OmlNode.W.Text || node.nodeName === OmlNode.A.Text;
    }

    public isRunNode(node: XmlNode): boolean {
        return node.nodeName === OmlNode.W.Run || node.nodeName === OmlNode.A.Run;
    }

    public isRunPropertiesNode(node: XmlNode): boolean {
        return node.nodeName === OmlNode.W.RunProperties || node.nodeName === OmlNode.A.RunProperties;
    }

    public isTableCellNode(node: XmlNode): boolean {
        return node.nodeName === OmlNode.W.TableCell;
    }

    public isParagraphNode(node: XmlNode): boolean {
        return node.nodeName === OmlNode.W.Paragraph || node.nodeName === OmlNode.A.Paragraph;
    }

    public isParagraphPropertiesNode(node: XmlNode): boolean {
        return node.nodeName === OmlNode.W.ParagraphProperties || node.nodeName === OmlNode.A.ParagraphProperties;
    }

    public isListParagraph(paragraphNode: XmlNode): boolean {
        const paragraphProperties = officeMarkup.query.findParagraphPropertiesNode(paragraphNode);
        const listNumberProperties = xml.query.findChildByName(paragraphProperties, OmlNode.W.NumberProperties);
        return !!listNumberProperties;
    }

    public findParagraphPropertiesNode(paragraphNode: XmlNode): XmlNode {
        if (!officeMarkup.query.isParagraphNode(paragraphNode))
            throw new Error(`Expected paragraph node but received a '${paragraphNode.nodeName}' node.`);

        return xml.query.findChild(paragraphNode, officeMarkup.query.isParagraphPropertiesNode);
    }

    /**
     * Search for the first direct child **Word** text node (i.e. a <w:t> node).
     */
    public firstTextNodeChild(node: XmlNode): XmlNode {

        if (!node)
            return null;

        if (!officeMarkup.query.isRunNode(node))
            return null;

        if (!node.childNodes)
            return null;

        for (const child of node.childNodes) {
            if (officeMarkup.query.isTextNode(child))
                return child;
        }

        return null;
    }

    /**
     * Search **upwards** for the first **Office** text node (i.e. a <w:t> or <a:t> node).
     */
    public containingTextNode(node: XmlTextNode): XmlGeneralNode {

        if (!node)
            return null;

        if (!xml.query.isTextNode(node))
            throw new Error(`'Invalid argument ${nameof(node)}. Expected a XmlTextNode.`);

        return xml.query.findParent(node, officeMarkup.query.isTextNode) as XmlGeneralNode;
    }

    /**
     * Search **upwards** for the first run node.
     */
    public containingRunNode(node: XmlNode): XmlNode {
        return xml.query.findParent(node, officeMarkup.query.isRunNode);
    }

    /**
     * Search **upwards** for the first paragraph node.
     */
    public containingParagraphNode(node: XmlNode): XmlNode {
        return xml.query.findParent(node, officeMarkup.query.isParagraphNode);
    }

    /**
     * Search **upwards** for the first "table row" node.
     */
    public containingTableRowNode(node: XmlNode): XmlNode {
        return xml.query.findParentByName(node, OmlNode.W.TableRow);
    }

    /**
     * Search **upwards** for the first "table cell" node.
     */
    public containingTableCellNode(node: XmlNode): XmlNode {
        return xml.query.findParent(node, officeMarkup.query.isTableCellNode);
    }

    /**
     * Search **upwards** for the first "table" node.
     */
    public containingTableNode(node: XmlNode): XmlNode {
        return xml.query.findParentByName(node, OmlNode.W.Table);
    }

    //
    // Advanced queries
    //

    public isEmptyTextNode(node: XmlNode): boolean {
        if (!officeMarkup.query.isTextNode(node))
            throw new Error(`Text node expected but '${node.nodeName}' received.`);

        if (!node.childNodes?.length)
            return true;

        const xmlTextNode = node.childNodes[0];
        if (!xml.query.isTextNode(xmlTextNode))
            throw new Error("Invalid XML structure. 'w:t' node should contain a single text node only.");

        if (!xmlTextNode.textContent)
            return true;

        return false;
    }

    public isEmptyRun(node: XmlNode): boolean {
        if (!officeMarkup.query.isRunNode(node))
            throw new Error(`Run node expected but '${node.nodeName}' received.`);

        for (const child of (node.childNodes ?? [])) {

            if (officeMarkup.query.isRunPropertiesNode(child))
                continue;

            if (officeMarkup.query.isTextNode(child) && officeMarkup.query.isEmptyTextNode(child))
                continue;

            return false;
        }

        return true;
    }
}

/**
 * Office Markup Language (OML) modify utilities.
 */
class Modify {

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
        const wordTextNode = officeMarkup.query.containingTextNode(textNode);
        const newWordTextNode = xml.create.cloneNode(wordTextNode, true);

        // set space preserve to prevent display differences after splitting
        // (otherwise if there was a space in the middle of the text node and it
        // is now at the beginning or end of the text node it will be ignored)
        officeMarkup.modify.setSpacePreserveAttribute(wordTextNode);
        officeMarkup.modify.setSpacePreserveAttribute(newWordTextNode);

        if (addBefore) {

            // insert new node before existing one
            xml.modify.insertBefore(newWordTextNode, wordTextNode);

            firstXmlTextNode = xml.query.lastTextChild(newWordTextNode);
            secondXmlTextNode = textNode;

        } else {

            // insert new node after existing one
            const curIndex = wordTextNode.parentNode.childNodes.indexOf(wordTextNode);
            xml.modify.insertChild(wordTextNode.parentNode, newWordTextNode, curIndex + 1);

            firstXmlTextNode = textNode;
            secondXmlTextNode = xml.query.lastTextChild(newWordTextNode);
        }

        // edit text
        const firstText = firstXmlTextNode.textContent;
        const secondText = secondXmlTextNode.textContent;
        firstXmlTextNode.textContent = firstText.substring(0, splitIndex);
        secondXmlTextNode.textContent = secondText.substring(splitIndex);

        return (addBefore ? firstXmlTextNode : secondXmlTextNode);
    }

    /**
     * Split the paragraph around the specified text node.
     *
     * @returns Two paragraphs - `left` and `right`. If the `removeTextNode` argument is
     * `false` then the original text node is the first text node of `right`.
     */
    public splitParagraphByTextNode(paragraph: XmlNode, textNode: XmlTextNode, removeTextNode: boolean): [XmlNode, XmlNode] {

        // input validation
        const containingParagraph = officeMarkup.query.containingParagraphNode(textNode);
        if (containingParagraph != paragraph)
            throw new Error(`Node '${nameof(textNode)}' is not a descendant of '${nameof(paragraph)}'.`);

        const runNode = officeMarkup.query.containingRunNode(textNode);
        const wordTextNode = officeMarkup.query.containingTextNode(textNode);

        // create run clone
        const leftRun = xml.create.cloneNode(runNode, false);
        const rightRun = runNode;
        xml.modify.insertBefore(leftRun, rightRun);

        // copy props from original run node (preserve style)
        const runProps = rightRun.childNodes.find(node => officeMarkup.query.isRunPropertiesNode(node));
        if (runProps) {
            const leftRunProps = xml.create.cloneNode(runProps, true);
            xml.modify.appendChild(leftRun, leftRunProps);
        }

        // move nodes from 'right' to 'left'
        const firstRunChildIndex = (runProps ? 1 : 0);
        let curChild = rightRun.childNodes[firstRunChildIndex];
        while (curChild != wordTextNode) {
            xml.modify.remove(curChild);
            xml.modify.appendChild(leftRun, curChild);
            curChild = rightRun.childNodes[firstRunChildIndex];
        }

        // remove text node
        if (removeTextNode) {
            xml.modify.removeChild(rightRun, firstRunChildIndex);
        }

        // create paragraph clone
        const leftPara = xml.create.cloneNode(containingParagraph, false);
        const rightPara = containingParagraph;
        xml.modify.insertBefore(leftPara, rightPara);

        // copy props from original paragraph (preserve style)
        const paragraphProps = rightPara.childNodes.find(node => officeMarkup.query.isParagraphPropertiesNode(node));
        if (paragraphProps) {
            const leftParagraphProps = xml.create.cloneNode(paragraphProps, true);
            xml.modify.appendChild(leftPara, leftParagraphProps);
        }

        // move nodes from 'right' to 'left'
        const firstParaChildIndex = (paragraphProps ? 1 : 0);
        curChild = rightPara.childNodes[firstParaChildIndex];
        while (curChild != rightRun) {
            xml.modify.remove(curChild);
            xml.modify.appendChild(leftPara, curChild);
            curChild = rightPara.childNodes[firstParaChildIndex];
        }

        // clean paragraphs - remove empty runs
        if (officeMarkup.query.isEmptyRun(leftRun))
            xml.modify.remove(leftRun);
        if (officeMarkup.query.isEmptyRun(rightRun))
            xml.modify.remove(rightRun);

        return [leftPara, rightPara];
    }

    /**
     * Move all text between the 'from' and 'to' nodes to the 'from' node.
     */
    public joinTextNodesRange(from: XmlTextNode, to: XmlTextNode): void {

        // find run nodes
        const firstRunNode = officeMarkup.query.containingRunNode(from);
        const secondRunNode = officeMarkup.query.containingRunNode(to);

        const paragraphNode = firstRunNode.parentNode;
        if (secondRunNode.parentNode !== paragraphNode)
            throw new Error('Can not join text nodes from separate paragraphs.');

        // find "word text nodes"
        const firstWordTextNode = officeMarkup.query.containingTextNode(from);
        const secondWordTextNode = officeMarkup.query.containingTextNode(to);
        const totalText: string[] = [];

        // iterate runs
        let curRunNode = firstRunNode;
        while (curRunNode) {

            // iterate text nodes
            let curWordTextNode: XmlNode;
            if (curRunNode === firstRunNode) {
                curWordTextNode = firstWordTextNode;
            } else {
                curWordTextNode = officeMarkup.query.firstTextNodeChild(curRunNode);
            }
            while (curWordTextNode) {

                if (!officeMarkup.query.isTextNode(curWordTextNode)) {
                    curWordTextNode = curWordTextNode.nextSibling;
                    continue;
                }

                // move text to first node
                const curXmlTextNode = xml.query.lastTextChild(curWordTextNode);
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
                    xml.modify.remove(textToRemove);
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
                xml.modify.remove(runToRemove);
            }
        }

        // set the text content
        const firstXmlTextNode = xml.query.lastTextChild(firstWordTextNode);
        firstXmlTextNode.textContent = totalText.join('');
    }

    /**
     * Take all runs from 'second' and move them to 'first'.
     */
    public joinParagraphs(first: XmlNode, second: XmlNode): void {
        if (first === second)
            return;

        let childIndex = 0;
        while (second.childNodes && childIndex < second.childNodes.length) {
            const curChild = second.childNodes[childIndex];
            if (officeMarkup.query.isRunNode(curChild)) {
                xml.modify.removeChild(second, childIndex);
                xml.modify.appendChild(first, curChild);
            } else {
                childIndex++;
            }
        }
    }

    public setSpacePreserveAttribute(node: XmlGeneralNode): void {
        if (!node.attributes) {
            node.attributes = {};
        }
        if (!node.attributes[OmlAttribute.SpacePreserve]) {
            node.attributes[OmlAttribute.SpacePreserve] = 'preserve';
        }
    }

    public removeTag(textNode: XmlTextNode): void {

        const wordTextNode = officeMarkup.query.containingTextNode(textNode);
        const runNode = officeMarkup.query.containingRunNode(textNode);

        // Remove the word text node
        xml.modify.remove(wordTextNode);

        // Remove the run node if it's empty
        if (officeMarkup.query.isEmptyRun(runNode)) {
            xml.modify.remove(runNode);
        }
    }
}

/**
 * Office Markup Language utilities.
 */
export const officeMarkup = new OfficeMarkup();
