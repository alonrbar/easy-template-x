import { TemplateContext, TextNodeTag } from "src/compilation";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office";
import { getRepeatMode, LoopTagOptions } from "src/plugins/loop/loopTagOptions";
import { xml, XmlNode } from "src/xml";
import { ILoopStrategy, SplitBeforeResult } from "./iLoopStrategy";

export class LoopListStrategy implements ILoopStrategy {

    public async isApplicable(openTag: TextNodeTag, closeTag: TextNodeTag, isCondition: boolean, context: TemplateContext): Promise<boolean> {
        if (isCondition) {
            return false;
        }

        // An explicit repeat mode takes precedence over list detection.
        const options = openTag.options as LoopTagOptions;
        const repeatMode = getRepeatMode(options);
        if (repeatMode) {
            return false;
        }

        const containingParagraph = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        const isListParagraph = await officeMarkup.query.isListParagraph(containingParagraph, context.docx.styles);
        return isListParagraph;
    }

    public splitBefore(openTag: TextNodeTag, closeTag: TextNodeTag): SplitBeforeResult {

        const firstParagraph = officeMarkup.query.containingParagraphNode(openTag.xmlTextNode);
        const lastParagraph = officeMarkup.query.containingParagraphNode(closeTag.xmlTextNode);

        // Make sure the paragraphs are siblings
        if (firstParagraph.parentNode !== lastParagraph.parentNode) {
            throw new TemplateSyntaxError(`Open and close tags are not in the same container: ${openTag.rawText} and ${closeTag.rawText}. For example, one is inside a table cell and the other is not.`);
        }

        const paragraphsToRepeat = xml.query.siblingsInRange(firstParagraph, lastParagraph);

        // Remove the loop tags
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

        // Remove the old paragraphs
        xml.modify.remove(firstParagraph);
        if (firstParagraph !== lastParagraphs) {
            xml.modify.remove(lastParagraphs);
        }
    }
}
