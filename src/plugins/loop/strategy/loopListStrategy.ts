import { Tag } from "src/compilation";
import { wml } from "src/office";
import { PluginUtilities } from "src/plugins/templatePlugin";
import { XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopListStrategy implements ILoopStrategy {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
    }

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
        const paragraphsToRepeat = XmlNode.siblingsInRange(firstParagraph, lastParagraph);

        // remove the loop tags
        XmlNode.remove(openTag.xmlTextNode);
        XmlNode.remove(closeTag.xmlTextNode);

        return {
            firstNode: firstParagraph,
            nodesToRepeat: paragraphsToRepeat,
            lastNode: lastParagraph
        };
    }

    public mergeBack(paragraphGroups: XmlNode[][], firstParagraph: XmlNode, lastParagraphs: XmlNode): void {

        for (const curParagraphsGroup of paragraphGroups) {
            for (const paragraph of curParagraphsGroup) {
                XmlNode.insertBefore(paragraph, lastParagraphs);
            }
        }

        // remove the old paragraphs
        XmlNode.remove(firstParagraph);
        if (firstParagraph !== lastParagraphs) {
            XmlNode.remove(lastParagraphs);
        }
    }
}
