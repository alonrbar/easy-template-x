import { MaxXmlDepthError } from '../errors';
import { pushMany } from '../utils';
import { XmlNode, XmlTextNode } from '../xmlNode';
import { Delimiter } from './delimiter';

export class TokenizerOptions {

    public maxXmlDepth = 20;
    public startDelimiter = "{";
    public endDelimiter = "}";

    constructor(initial?: TokenizerOptions) {
        if (initial) {

            if (initial.startDelimiter)
                this.startDelimiter = XmlNode.encodeValue(initial.startDelimiter);

            if (initial.endDelimiter)
                this.endDelimiter = XmlNode.encodeValue(initial.endDelimiter);

        }

        if (!this.startDelimiter || !this.endDelimiter)
            throw new Error('Both delimiters must be specified.');

        if (this.startDelimiter === this.endDelimiter)
            throw new Error('Start and end delimiters can not be the same.');
    }
}

export class Tokenizer {

    // TODO: get from outside
    private readonly options = new TokenizerOptions();

    public findDelimiters(node: XmlNode): Delimiter[] {
        const tokens: Delimiter[] = [];
        this.findRecurse(node, tokens, 0);
        return tokens;
    }

    private findRecurse(node: XmlNode, tokens: Delimiter[], depth: number): void {
        if (depth > this.options.maxXmlDepth)
            throw new MaxXmlDepthError(this.options.maxXmlDepth);

        if (!node)
            return;

        // process self
        if (XmlNode.isTextNode(node)) {

            const curTokens = this.createDelimiterMark(node);
            if (curTokens.length) {
                pushMany(tokens, curTokens);
            }

            return;
        }

        // process child nodes
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            const child = node.childNodes[i];
            this.findRecurse(child, tokens, depth + 1);
        }
    }

    private createDelimiterMark(node: XmlTextNode): Delimiter[] {

        // empty text node
        if (!node.textContent) {
            return [];
        }

        // delimiter tokens
        // TODO: support delimiters longer than one character
        const delimiterTokens: Delimiter[] = [];
        for (let i = 0; i < node.textContent.length; i++) {
            if (node.textContent[i] === this.options.startDelimiter) {
                delimiterTokens.push({
                    index: i,
                    isOpen: true,
                    xmlTextNode: node
                });
            } else if (node.textContent[i] === this.options.endDelimiter) {
                delimiterTokens.push({
                    index: i,
                    isOpen: false,
                    xmlTextNode: node
                });
            }
        }

        return delimiterTokens;
    }
}