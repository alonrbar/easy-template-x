import { TextNodeTag } from "src/compilation";
import { officeMarkup } from "src/office";
import { xml, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopParagraphStrategy implements ILoopStrategy {

    public isApplicable(openTag: TextNodeTag, closeTag: TextNodeTag, isCondition: boolean): boolean {
        return true;
    }

    public splitBefore(openTag: TextNodeTag, closeTag: TextNodeTag): SplitBeforeResult {

        // Gather some info
        let firstParagraph: XmlNode = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        let lastParagraph: XmlNode = officeMarkup.query.containingParagraphNode(closeTag.xmlTextNode);
        const areSame = (firstParagraph === lastParagraph);

        // Split first paragraph
        const removeTextNode = true;
        let splitResult = officeMarkup.modify.splitParagraphByTextNode(firstParagraph, openTag.xmlTextNode, removeTextNode);
        firstParagraph = splitResult[0];
        let afterFirstParagraph = splitResult[1];
        if (areSame)
            lastParagraph = afterFirstParagraph;

        // Split last paragraph
        splitResult = officeMarkup.modify.splitParagraphByTextNode(lastParagraph, closeTag.xmlTextNode, removeTextNode);
        const beforeLastParagraph = splitResult[0];
        lastParagraph = splitResult[1];
        if (areSame)
            afterFirstParagraph = beforeLastParagraph;

        // Disconnect splitted paragraph from their parents
        xml.modify.remove(afterFirstParagraph);
        if (!areSame)
            xml.modify.remove(beforeLastParagraph);

        // Extract all paragraphs in between
        let middleParagraphs: XmlNode[];
        if (areSame) {
            middleParagraphs = [afterFirstParagraph];
        } else {
            const inBetween = xml.modify.removeSiblings(firstParagraph, lastParagraph);
            middleParagraphs = [afterFirstParagraph].concat(inBetween).concat(beforeLastParagraph);
        }

        return {
            firstNode: firstParagraph,
            nodesToRepeat: middleParagraphs,
            lastNode: lastParagraph
        };
    }

    public mergeBack(middleParagraphs: XmlNode[][], firstParagraph: XmlNode, lastParagraph: XmlNode): void {

        let mergeTo = firstParagraph;
        for (const curParagraphsGroup of middleParagraphs) {

            // Merge first paragraphs
            officeMarkup.modify.joinParagraphs(mergeTo, curParagraphsGroup[0]);

            // Add middle and last paragraphs to the original document
            for (let i = 1; i < curParagraphsGroup.length; i++) {
                xml.modify.insertBefore(curParagraphsGroup[i], lastParagraph);
                mergeTo = curParagraphsGroup[i];
            }
        }

        // Merge last paragraph
        officeMarkup.modify.joinParagraphs(mergeTo, lastParagraph);

        // Remove the old last paragraph (was merged into the new one)
        xml.modify.remove(lastParagraph);
    }
}
