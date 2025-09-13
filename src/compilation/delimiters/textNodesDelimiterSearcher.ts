import { officeMarkup } from "src/office";
import { first, last } from "src/utils";
import { xml, XmlTextNode, XmlTreeIterator } from "src/xml";
import { TextNodeDelimiterMark } from "./delimiterMark";
import { TagPlacement } from "src/compilation/tag";

export class TextNodesDelimiterSearcher {    

    private lookForOpenDelimiter = true;
    /**
     * The index of the current delimiter character being matched.
     *
     * Example: If the delimiter is `{!` and delimiterIndex is 0, it means we
     * are now looking for the character `{`. If it is 1, then we are looking
     * for `!`.
     */
    private lookForDelimiterIndex = 0;
    /**
     * The list of text nodes containing the delimiter characters of the current match.
     */
    private matchOpenNodes: XmlTextNode[] = [];
    /**
     * The index of the first character of the current delimiter match, in the text node it
     * was found at.
     *
     * Example: If the delimiter is `{!`, and the text node content is `abc{!xyz`,
     * then the firstMatchIndex is 3.
     */
    private firstMatchIndex = -1;

    private readonly startDelimiter: string;
    private readonly endDelimiter: string;

    public constructor(startDelimiter: string, endDelimiter: string) {
        this.startDelimiter = startDelimiter;
        this.endDelimiter = endDelimiter;
    }

    public processNode(it: XmlTreeIterator, delimiters: TextNodeDelimiterMark[]): void {

        // Reset match state on paragraph transition
        if (officeMarkup.query.isParagraphNode(it.node)) {
            this.resetMatch();
        }

        // Ignore non-text nodes
        if (!this.shouldSearchNode(it)) {
            return;
        }

        // Search delimiters in text nodes
        this.findDelimiters(it, delimiters);
    }

    private resetMatch() {
        this.lookForDelimiterIndex = 0;
        this.matchOpenNodes = [];
        this.firstMatchIndex = -1;
    }

    private shouldSearchNode(it: XmlTreeIterator): it is XmlTreeIterator<XmlTextNode> {

        if (!xml.query.isTextNode(it.node))
            return false;
        if (!it.node.textContent)
            return false;
        if (!it.node.parentNode)
            return false;
        if (!officeMarkup.query.isTextNode(it.node.parentNode))
            return false;

        return true;
    }

    private findDelimiters(it: XmlTreeIterator<XmlTextNode>, delimiters: TextNodeDelimiterMark[]): void {

        //
        // Performance note:
        //
        // The search efficiency is o(m*n) where n is the text size and m is the
        // delimiter length. We could use a variation of the KMP algorithm here
        // to reduce it to o(m+n) but since our m is expected to be small
        // (delimiters defaults to a single characters and even on custom inputs
        // are not expected to be much longer) it does not worth the extra
        // complexity and effort.
        //

        // Search delimiters in text nodes
        this.matchOpenNodes.push(it.node);
        let textIndex = 0;
        while (textIndex < it.node.textContent.length) {

            const delimiterPattern = this.lookForOpenDelimiter ? this.startDelimiter : this.endDelimiter;
            const char = it.node.textContent[textIndex];

            // No match
            if (char !== delimiterPattern[this.lookForDelimiterIndex]) {
                textIndex = this.noMatch(it, textIndex);
                textIndex++;
                continue;
            }

            // First match
            if (this.firstMatchIndex === -1) {
                this.firstMatchIndex = textIndex;
            }

            // Partial match
            if (this.lookForDelimiterIndex !== delimiterPattern.length - 1) {
                this.lookForDelimiterIndex++;
                textIndex++;
                continue;
            }

            // Full delimiter match
            textIndex = this.fullMatch(it, textIndex, delimiters);
            textIndex++;
        }
    }

    private noMatch(it: XmlTreeIterator<XmlTextNode>, textIndex: number): number {
        //
        // Go back to first open node
        //
        // Required for cases where the text has repeating
        // characters that are the same as a delimiter prefix.
        // For instance:
        // Delimiter is '{!' and template text contains the string '{{!'
        //
        if (this.firstMatchIndex !== -1) {
            const node = first(this.matchOpenNodes);
            it.setCurrent(node);
            textIndex = this.firstMatchIndex;
        }

        // Update state
        this.resetMatch();
        if (textIndex < it.node.textContent.length - 1) {
            this.matchOpenNodes.push(it.node);
        }

        return textIndex;
    }

    private fullMatch(it: XmlTreeIterator<XmlTextNode>, textIndex: number, delimiters: TextNodeDelimiterMark[]): number {

        // Move all delimiters characters to the same text node
        if (this.matchOpenNodes.length > 1) {

            const firstNode = first(this.matchOpenNodes);
            const lastNode = last(this.matchOpenNodes);
            officeMarkup.modify.joinTextNodesRange(firstNode, lastNode);

            textIndex += (firstNode.textContent.length - it.node.textContent.length);
            it.setCurrent(firstNode);
        }

        // Store delimiter
        const delimiterMark = this.createCurrentDelimiterMark();
        delimiters.push(delimiterMark);

        // Update state
        this.lookForOpenDelimiter = !this.lookForOpenDelimiter;
        this.resetMatch();
        if (textIndex < it.node.textContent.length - 1) {
            this.matchOpenNodes.push(it.node);
        }

        return textIndex;
    }

    private createCurrentDelimiterMark(): TextNodeDelimiterMark {
        return {
            placement: TagPlacement.TextNode,
            index: this.firstMatchIndex,
            isOpen: this.lookForOpenDelimiter,
            xmlTextNode: this.matchOpenNodes[0]
        };
    }
}
