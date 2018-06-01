import { Delimiters } from '../delimiters';
import { MaxXmlDepthError } from '../errors';
import { MAX_XML_DEPTH } from '../utils';
import { TemplateToken, TokenType } from './templateToken';

export class Tokenizer {

    public delimiters = new Delimiters();

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

            const curToken = this.createToken(node);

            const lastToken = (tokens.length ? tokens[tokens.length - 1] : null);
            if (lastToken) {
                curToken.prev = lastToken;
                lastToken.next = curToken;
            }

            tokens.push(curToken);
            return;
        }

        // process child nodes
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            const child = node.childNodes.item(i);
            this.tokenizeRecurse(child, tokens, depth + 1);
        }
    }

    private createToken(node: Node): TemplateToken {

        const token = new TemplateToken({ xmlNode: node });
        const tokenText = node.textContent;

        if (!tokenText) {
            token.type = TokenType.Empty;
            return token;
        }

        const delimiterStartIndex = tokenText.indexOf(this.delimiters.start);
        if (delimiterStartIndex !== -1) {
            token.type = TokenType.DelimiterStart;
            token.delimiterIndex = delimiterStartIndex;
            return token;
        }

        const delimiterEndIndex = tokenText.indexOf(this.delimiters.end);
        if (delimiterEndIndex !== -1) {
            token.type = TokenType.DelimiterEnd;
            token.delimiterIndex = delimiterEndIndex;
            return token;
        }

        token.type = TokenType.Text;
        return token;
    }
}