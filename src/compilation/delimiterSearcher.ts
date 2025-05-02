import { officeMarkup } from "src/office";
import { first, last } from "src/utils";
import { xml, XmlNode, XmlTextNode, XmlTreeIterator } from "src/xml";
import { DelimiterMark } from "./delimiterMark";

class MatchState {

    /**
     * The index of the current delimiter character being matched.
     *
     * Example: If the delimiter is `{!` and delimiterIndex is 0, it means we
     * are now looking for the character `{`. If it is 1, then we are looking
     * for `!`.
     */
    public delimiterIndex = 0;
    /**
     * The list of text nodes containing the delimiter characters.
     */
    public openNodes: XmlTextNode[] = [];
    /**
     * The index of the first character of the delimiter, in the text node it
     * was found at.
     *
     * Example: If the delimiter is `{!`, and the text node content is `abc{!xyz`,
     * then the firstMatchIndex is 3.
     */
    public firstMatchIndex = -1;

    public reset() {
        this.delimiterIndex = 0;
        this.openNodes = [];
        this.firstMatchIndex = -1;
    }
}

export class DelimiterSearcher {

    public maxXmlDepth = 20;
    public startDelimiter = "{";
    public endDelimiter = "}";

    public findDelimiters(node: XmlNode): DelimiterMark[] {

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

        const delimiters: DelimiterMark[] = [];
        const match = new MatchState();
        const it = new XmlTreeIterator(node, this.maxXmlDepth);
        let lookForOpenDelimiter = true;

        while (it.node) {

            // Reset state on paragraph transition
            if (officeMarkup.query.isParagraphNode(it.node)) {
                match.reset();
            }

            // Skip irrelevant nodes
            if (!this.shouldSearchNode(it)) {
                it.next();
                continue;
            }

            // Search delimiters in text nodes
            match.openNodes.push(it.node);
            let textIndex = 0;
            while (textIndex < it.node.textContent.length) {

                const delimiterPattern = lookForOpenDelimiter ? this.startDelimiter : this.endDelimiter;
                const char = it.node.textContent[textIndex];

                // No match
                if (char !== delimiterPattern[match.delimiterIndex]) {
                    textIndex = this.noMatch(it, textIndex, match);
                    textIndex++;
                    continue;
                }

                // First match
                if (match.firstMatchIndex === -1) {
                    match.firstMatchIndex = textIndex;
                }

                // Partial match
                if (match.delimiterIndex !== delimiterPattern.length - 1) {
                    match.delimiterIndex++;
                    textIndex++;
                    continue;
                }

                // Full delimiter match
                [textIndex, lookForOpenDelimiter] = this.fullMatch(it, textIndex, lookForOpenDelimiter, match, delimiters);
                textIndex++;
            }

            it.next();
        }

        return delimiters;
    }

    private noMatch(it: XmlTreeIterator<XmlTextNode>, textIndex: number, match: MatchState): number {
        //
        // Go back to first open node
        //
        // Required for cases where the text has repeating
        // characters that are the same as a delimiter prefix.
        // For instance:
        // Delimiter is '{!' and template text contains the string '{{!'
        //
        if (match.firstMatchIndex !== -1) {
            const node = first(match.openNodes);
            it.setCurrent(node);
            textIndex = match.firstMatchIndex;
        }

        // Update state
        match.reset();
        if (textIndex < it.node.textContent.length - 1) {
            match.openNodes.push(it.node);
        }

        return textIndex;
    }

    private fullMatch(it: XmlTreeIterator<XmlTextNode>, textIndex: number, lookForOpenDelimiter: boolean, match: MatchState, delimiters: DelimiterMark[]): [number, boolean] {

        // Move all delimiters characters to the same text node
        if (match.openNodes.length > 1) {

            const firstNode = first(match.openNodes);
            const lastNode = last(match.openNodes);
            officeMarkup.modify.joinTextNodesRange(firstNode, lastNode);

            textIndex += (firstNode.textContent.length - it.node.textContent.length);
            it.setCurrent(firstNode);
        }

        // Store delimiter
        const delimiterMark = this.createDelimiterMark(match, lookForOpenDelimiter);
        delimiters.push(delimiterMark);

        // Update state
        lookForOpenDelimiter = !lookForOpenDelimiter;
        match.reset();
        if (textIndex < it.node.textContent.length - 1) {
            match.openNodes.push(it.node);
        }

        return [textIndex, lookForOpenDelimiter];
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

    private createDelimiterMark(match: MatchState, isOpenDelimiter: boolean): DelimiterMark {
        return {
            index: match.firstMatchIndex,
            isOpen: isOpenDelimiter,
            xmlTextNode: match.openNodes[0]
        };
    }
}
