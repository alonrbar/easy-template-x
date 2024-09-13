import { MissingArgumentError } from '../errors';
import { DocxParser } from '../office';
import { first, last } from '../utils';
import { XmlDepthTracker, XmlNode, XmlTextNode } from '../xml';
import { DelimiterMark } from './delimiterMark';

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

    constructor(private readonly docxParser: DocxParser) {
        if (!docxParser)
            throw new MissingArgumentError(nameof(docxParser));
    }

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
        const depth = new XmlDepthTracker(this.maxXmlDepth);
        let lookForOpenDelimiter = true;

        while (node) {

            // Reset state on paragraph transition
            if (this.docxParser.isParagraphNode(node)) {
                match.reset();
            }

            // Skip irrelevant nodes
            if (!this.shouldSearchNode(node)) {
                node = this.findNextNode(node, depth);
                continue;
            }

            // Search delimiters in text nodes
            match.openNodes.push(node);
            let textIndex = 0;
            while (textIndex < node.textContent.length) {

                const delimiterPattern = lookForOpenDelimiter ? this.startDelimiter : this.endDelimiter;
                const char = node.textContent[textIndex];

                // No match
                if (char !== delimiterPattern[match.delimiterIndex]) {
                    [node, textIndex] = this.noMatch(node, textIndex, match);
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
                [node, textIndex, lookForOpenDelimiter] = this.fullMatch(node, textIndex, lookForOpenDelimiter, match, delimiters);
                textIndex++;
            }

            node = this.findNextNode(node, depth);
        }

        return delimiters;
    }

    private noMatch(node: XmlTextNode, textIndex: number, match: MatchState): [XmlTextNode, number] {
        //
        // Go back to first open node
        //
        // Required for cases where the text has repeating
        // characters that are the same as a delimiter prefix.
        // For instance:
        // Delimiter is '{!' and template text contains the string '{{!'
        //
        if (match.firstMatchIndex !== -1) {
            node = first(match.openNodes);
            textIndex = match.firstMatchIndex;
        }

        // Update state
        match.reset();
        if (textIndex < node.textContent.length - 1) {
            match.openNodes.push(node);
        }

        return [node, textIndex];
    }

    private fullMatch(node: XmlTextNode, textIndex: number, lookForOpenDelimiter: boolean, match: MatchState, delimiters: DelimiterMark[]): [XmlTextNode, number, boolean] {

        // Move all delimiters characters to the same text node
        if (match.openNodes.length > 1) {

            const firstNode = first(match.openNodes);
            const lastNode = last(match.openNodes);
            this.docxParser.joinTextNodesRange(firstNode, lastNode);

            textIndex += (firstNode.textContent.length - node.textContent.length);
            node = firstNode;
        }

        // Store delimiter
        const delimiterMark = this.createDelimiterMark(match, lookForOpenDelimiter);
        delimiters.push(delimiterMark);

        // Update state
        lookForOpenDelimiter = !lookForOpenDelimiter;
        match.reset();
        if (textIndex < node.textContent.length - 1) {
            match.openNodes.push(node);
        }

        return [node, textIndex, lookForOpenDelimiter];
    }

    private shouldSearchNode(node: XmlNode): node is XmlTextNode {

        if (!XmlNode.isTextNode(node))
            return false;
        if (!node.textContent)
            return false;
        if (!node.parentNode)
            return false;
        if (!this.docxParser.isTextNode(node.parentNode))
            return false;

        return true;
    }

    private findNextNode(node: XmlNode, depth: XmlDepthTracker): XmlNode {

        // Children
        if (node.childNodes && node.childNodes.length) {
            depth.increment();
            return node.childNodes[0];
        }

        // Siblings
        if (node.nextSibling)
            return node.nextSibling;

        // Parent sibling
        while (node.parentNode) {

            if (node.parentNode.nextSibling) {
                depth.decrement();
                return node.parentNode.nextSibling;
            }

            // Go up
            depth.decrement();
            node = node.parentNode;
        }

        return null;
    }

    private createDelimiterMark(match: MatchState, isOpenDelimiter: boolean): DelimiterMark {
        return {
            index: match.firstMatchIndex,
            isOpen: isOpenDelimiter,
            xmlTextNode: match.openNodes[0]
        };
    }
}
