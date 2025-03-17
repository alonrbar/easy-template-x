import { Tag } from "src/compilation";
import { wml } from "src/office";
import { xml, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopListStrategy implements ILoopStrategy {

    public isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean {
        if (isCondition) {
            return false;
        }

        const containingParagraph = wml.query.containingParagraphNode(openTag.xmlTextNode);
        return wml.query.isListParagraph(containingParagraph);
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        const firstParagraph = wml.query.containingParagraphNode(openTag.xmlTextNode);
        const lastParagraph = wml.query.containingParagraphNode(closeTag.xmlTextNode);
        const paragraphsToRepeat = xml.query.siblingsInRange(firstParagraph, lastParagraph);

        // remove the loop tags
        xml.modify.remove(openTag.xmlTextNode);
        xml.modify.remove(closeTag.xmlTextNode);

        return {
            firstNode: firstParagraph,
            nodesToRepeat: paragraphsToRepeat,
            lastNode: lastParagraph
        };
    }

    public mergeBack(paragraphGroups: XmlNode[][], firstParagraph: XmlNode, lastParagraphs: XmlNode): void {

        for (const curParagraphsGroup of paragraphGroups) {
            for (const paragraph of curParagraphsGroup) {
                xml.modify.insertBefore(paragraph, lastParagraphs);
            }
        }

        // remove the old paragraphs
        xml.modify.remove(firstParagraph);
        if (firstParagraph !== lastParagraphs) {
            xml.modify.remove(lastParagraphs);
        }
    }
}
