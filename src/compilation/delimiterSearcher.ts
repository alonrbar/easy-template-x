import { MaxXmlDepthError } from '../errors';
import { pushMany } from '../utils';
import { XmlNode, XmlTextNode } from '../xml';
import { DelimiterMark } from './delimiterMark';

export class DelimiterSearcher {

    public maxXmlDepth = 20;
    public startDelimiter = "{";
    public endDelimiter = "}";

    public findDelimiters(node: XmlNode): DelimiterMark[] {
        const delimiters: DelimiterMark[] = [];
        this.findRecurse(node, delimiters, 0);
        return delimiters;
    }

    private findRecurse(node: XmlNode, delimiters: DelimiterMark[], depth: number): void {
        if (depth > this.maxXmlDepth)
            throw new MaxXmlDepthError(this.maxXmlDepth);

        if (!node)
            return;

        // process self
        if (XmlNode.isTextNode(node)) {

            const curTokens = this.findInNode(node);
            if (curTokens.length) {
                pushMany(delimiters, curTokens);
            }

            return;
        }

        // process child nodes
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            const child = node.childNodes[i];
            this.findRecurse(child, delimiters, depth + 1);
        }
    }

    private findInNode(node: XmlTextNode): DelimiterMark[] {

        if (!node.textContent) {
            return [];
        }

        // TODO: support delimiters longer than one character
        
        const delimiterMarks: DelimiterMark[] = [];
        for (let i = 0; i < node.textContent.length; i++) {
            if (node.textContent[i] === this.startDelimiter) {
                delimiterMarks.push({
                    index: i,
                    isOpen: true,
                    xmlTextNode: node
                });
            } else if (node.textContent[i] === this.endDelimiter) {
                delimiterMarks.push({
                    index: i,
                    isOpen: false,
                    xmlTextNode: node
                });
            }
        }

        return delimiterMarks;
    }
}