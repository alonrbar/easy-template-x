import { Tag } from "src/compilation";
import { wml } from "src/office";
import { PluginUtilities } from "src/plugins/templatePlugin";
import { XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopParagraphStrategy implements ILoopStrategy {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
    }

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        return true;
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        // gather some info
        let firstParagraph = wml.query.containingParagraphNode(openTag.xmlTextNode);
        let lastParagraph = wml.query.containingParagraphNode(closeTag.xmlTextNode);
        const areSame = (firstParagraph === lastParagraph);

        // split first paragraph
        let splitResult = wml.modify.splitParagraphByTextNode(firstParagraph, openTag.xmlTextNode, true);
        firstParagraph = splitResult[0];
        let afterFirstParagraph = splitResult[1];
        if (areSame)
            lastParagraph = afterFirstParagraph;

        // split last paragraph
        splitResult = wml.modify.splitParagraphByTextNode(lastParagraph, closeTag.xmlTextNode, true);
        const beforeLastParagraph = splitResult[0];
        lastParagraph = splitResult[1];
        if (areSame)
            afterFirstParagraph = beforeLastParagraph;

        // disconnect splitted paragraph from their parents
        XmlNode.remove(afterFirstParagraph);
        if (!areSame)
            XmlNode.remove(beforeLastParagraph);

        // extract all paragraphs in between
        let middleParagraphs: XmlNode[];
        if (areSame) {
            middleParagraphs = [afterFirstParagraph];
        } else {
            const inBetween = XmlNode.removeSiblings(firstParagraph, lastParagraph);
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

            // merge first paragraphs
            wml.modify.joinParagraphs(mergeTo, curParagraphsGroup[0]);

            // add middle and last paragraphs to the original document
            for (let i = 1; i < curParagraphsGroup.length; i++) {
                XmlNode.insertBefore(curParagraphsGroup[i], lastParagraph);
                mergeTo = curParagraphsGroup[i];
            }
        }

        // merge last paragraph
        wml.modify.joinParagraphs(mergeTo, lastParagraph);

        // remove the old last paragraph (was merged into the new one)
        XmlNode.remove(lastParagraph);
    }
}
