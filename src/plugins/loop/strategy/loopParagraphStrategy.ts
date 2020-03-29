import { Tag } from '../../../compilation';
import { XmlNode } from '../../../xml';
import { PluginUtilities } from '../../templatePlugin';
import { ILoopStrategy, SplitBeforeResult } from './iLoopStrategy';

export class LoopParagraphStrategy implements ILoopStrategy {

    private utilities: PluginUtilities;

    public setUtilities(utilities: PluginUtilities) {
        this.utilities = utilities;
    }

    public isApplicable(openTag: Tag, closeTag: Tag): boolean {
        return true;
    }

    public splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult {

        // gather some info
        let firstParagraph = this.utilities.docxParser.containingParagraphNode(openTag.xmlTextNode);
        let lastParagraph = this.utilities.docxParser.containingParagraphNode(closeTag.xmlTextNode);
        const areSame = (firstParagraph === lastParagraph);
        const parent = firstParagraph.parentNode;
        const firstParagraphIndex = parent.childNodes.indexOf(firstParagraph);
        const lastParagraphIndex = areSame ? firstParagraphIndex : parent.childNodes.indexOf(lastParagraph);

        // split first paragraphs
        let splitResult = XmlNode.splitByChild(firstParagraph, openTag.xmlTextNode, true);
        firstParagraph = splitResult[0];
        const firstParagraphSplit = splitResult[1];
        if (areSame)
            lastParagraph = firstParagraphSplit;

        // split last paragraph
        splitResult = XmlNode.splitByChild(lastParagraph, closeTag.xmlTextNode, true);
        const lastParagraphSplit = splitResult[0];
        lastParagraph = splitResult[1];

        // fix references
        XmlNode.removeChild(parent, firstParagraphIndex + 1);
        if (!areSame)
            XmlNode.removeChild(parent, lastParagraphIndex);
        firstParagraphSplit.parentNode = null;
        lastParagraphSplit.parentNode = null;

        // extract all paragraphs in between
        let middleParagraphs: XmlNode[];
        if (areSame) {
            this.utilities.docxParser.joinParagraphs(firstParagraphSplit, lastParagraphSplit);
            middleParagraphs = [firstParagraphSplit];
        } else {
            const inBetween = XmlNode.removeSiblings(firstParagraph, lastParagraph);
            middleParagraphs = [firstParagraphSplit].concat(inBetween).concat(lastParagraphSplit);
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
            this.utilities.docxParser.joinParagraphs(mergeTo, curParagraphsGroup[0]);

            // add middle and last paragraphs to the original document
            for (let i = 1; i < curParagraphsGroup.length; i++) {
                XmlNode.insertBefore(curParagraphsGroup[i], lastParagraph);
                mergeTo = curParagraphsGroup[i];
            }
        }

        // merge last paragraph
        this.utilities.docxParser.joinParagraphs(mergeTo, lastParagraph);

        // remove the old last paragraph (was merged into the new one)
        XmlNode.remove(lastParagraph);
    }
}
