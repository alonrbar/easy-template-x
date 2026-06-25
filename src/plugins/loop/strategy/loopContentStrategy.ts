import { TextNodeTag } from "src/compilation";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office";
import { xml, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopContentStrategy implements ILoopStrategy {

    public isApplicable(openTag: TextNodeTag, closeTag: TextNodeTag, isCondition: boolean): boolean {
        return true;
    }

    public splitBefore(openTag: TextNodeTag, closeTag: TextNodeTag): SplitBeforeResult {

        // Gather some info
        let firstParagraph: XmlNode = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        let lastParagraph: XmlNode = officeMarkup.query.containingParagraphNode(closeTag.xmlTextNode);
        const areSame = (firstParagraph === lastParagraph);

        // The open and close tags must live in paragraphs that are siblings of
        // the same parent. Otherwise the loop spans a structural boundary (for
        // instance, one tag is inside a table cell and the other is not) and we
        // would fail later on while trying to collect the nodes in between with
        // an obscure "Cannot read properties of undefined (reading
        // 'nextSibling')" error. Fail fast with a clear message instead.
        if (!areSame && firstParagraph.parentNode !== lastParagraph.parentNode) {
            throw new TemplateSyntaxError(
                `Loop open and close tags are not placed in the same container: "${openTag.rawText}" and "${closeTag.rawText}". ` +
                `Make sure both tags are at the same level (for example, both outside of a table, or both within the same table cell).`
            );
        }

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
