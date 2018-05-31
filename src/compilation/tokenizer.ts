import { MaxXmlDepthError } from '../errors';
import { MAX_XML_DEPTH } from '../utils';
import { TemplateToken } from './templateToken';

export class Tokenizer {

    public tokenize(node: Node): TemplateToken[] {
        const tokens: TemplateToken[] = [];
        this.tokenizeRecurse(node, tokens, 0);
        return tokens;
    }

    private tokenizeRecurse(node: Node, tokens: TemplateToken[], depth: number): void {
        if (depth > MAX_XML_DEPTH)
            throw new MaxXmlDepthError(depth);

        if (!node)
            return;

        // process self
        if (node.nodeType === node.TEXT_NODE) {
            return;
        }

        // process child nodes
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            const child = node.childNodes.item(i);
            this.tokenizeRecurse(child, tokens, depth + 1);
        }
    }
}