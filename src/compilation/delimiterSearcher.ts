import { MissingArgumentError } from '../errors';
import { DocxParser } from '../office';
import { first, last } from '../utils';
import { XmlDepthTracker, XmlNode, XmlTextNode } from '../xml';
import { DelimiterMark } from './delimiterMark';

class MatchState {

    public delimiterIndex = 0;
    public openNodes: XmlTextNode[] = [];
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
        // (delimiters defaults to 2 characters and even on custom inputs are
        // not expected to be much longer) it does not worth the extra
        // complexity and effort.
        //

        const delimiters: DelimiterMark[] = [];
        const match = new MatchState();
        const depth = new XmlDepthTracker(this.maxXmlDepth);
        let lookForOpenDelimiter = true;

        while (node) {

            // reset state on paragraph transition
            if (this.docxParser.isParagraphNode(node)) {
                match.reset();
            }

            // skip irrelevant nodes
            if (!this.shouldSearchNode(node)) {
                node = this.findNextNode(node, depth);
                continue;
            }

            // search delimiters in text nodes
            match.openNodes.push(node);
            let textIndex = 0;
            while (textIndex < node.textContent.length) {

                const delimiterPattern = lookForOpenDelimiter ? this.startDelimiter : this.endDelimiter;

                // char match
                const char = node.textContent[textIndex];
                if (char === delimiterPattern[match.delimiterIndex]) {

                    // first match
                    if (match.firstMatchIndex === -1) {
                        match.firstMatchIndex = textIndex;
                    }

                    // full delimiter match
                    if (match.delimiterIndex === delimiterPattern.length - 1) {

                        // move all delimiters characters to the same text node
                        if (match.openNodes.length > 1) {
                            
                            const firstNode = first(match.openNodes);
                            const lastNode = last(match.openNodes);
                            this.docxParser.joinTextNodesRange(firstNode, lastNode);
                            
                            textIndex += (firstNode.textContent.length - node.textContent.length);
                            node = firstNode;
                        }

                        // store delimiter
                        const delimiterMark = this.createDelimiterMark(match, lookForOpenDelimiter);
                        delimiters.push(delimiterMark);

                        // update state
                        lookForOpenDelimiter = !lookForOpenDelimiter;
                        match.reset();
                        if (textIndex < node.textContent.length - 1) {
                            match.openNodes.push(node);
                        }

                    } else {
                        match.delimiterIndex++;
                    }
                }

                // no match
                else {

                    //
                    // go back to first open node
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

                    // update state
                    match.reset();
                    if (textIndex < node.textContent.length - 1) {
                        match.openNodes.push(node);
                    }
                }

                textIndex++;
            }

            node = this.findNextNode(node, depth);
        }

        return delimiters;
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

        // children
        if (node.childNodes && node.childNodes.length) {
            depth.increment();
            return node.childNodes[0];
        }

        // siblings
        if (node.nextSibling)
            return node.nextSibling;

        // parent sibling
        while (node.parentNode) {

            if (node.parentNode.nextSibling) {
                depth.decrement();
                return node.parentNode.nextSibling;
            }

            // go up
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