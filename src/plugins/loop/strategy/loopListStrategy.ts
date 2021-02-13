import { Tag } from '../../../compilation';
import { XmlNode } from '../../../xml';
import { PluginUtilities } from '../../templatePlugin';
import { ILoopStrategy, SplitBeforeResult } from './iLoopStrategy';

export class LoopListStrategy implements ILoopStrategy {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
    }

    public isApplicable(openTag: Tag, closeTag: Tag): boolean {
        const containingParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
        return this.utilities.docxParser.isListParagraph(containingParagraph);
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        const firstParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
        const lastParagraph = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);
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
