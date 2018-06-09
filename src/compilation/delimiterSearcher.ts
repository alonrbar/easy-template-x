import { Delimiters } from '../delimiters';
import { MaxXmlDepthError } from '../errors';
import { MAX_XML_DEPTH } from '../utils';
import { XmlNode, XmlTextNode } from '../xmlNode';
import { TemplateToken, TokenType } from './templateToken';

export class Tokenizer {

    public delimiters = new Delimiters();

    public tokenize(node: XmlNode): TemplateToken[] {
        const tokens: TemplateToken[] = [];
        this.tokenizeRecurse(node, tokens, 0);
        return tokens;
    }

    private tokenizeRecurse(node: XmlNode, tokens: TemplateToken[], depth: number): void {
        if (depth > MAX_XML_DEPTH)
            throw new MaxXmlDepthError(depth);

        if (!node)
            return;

        // process self
        if (XmlNode.isTextNode(node)) {

            const curToken = this.createToken(node);
            tokens.push(curToken);
            return;
        }

        // process child nodes
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            const child = node.childNodes[i];
            this.tokenizeRecurse(child, tokens, depth + 1);
        }
    }

    private createToken(node: XmlTextNode): TemplateToken {

        const token = new TemplateToken({ xmlTextNode: node });
        const tokenText = node.textContent;

        // empty tokens
        if (!tokenText) {
            token.type = TokenType.Empty;
            return token;
        }

        // delimiter tokens
        for (let i = 0; i < tokenText.length; i++) {
            if (tokenText[i] === this.delimiters.start) {
                token.delimiters.push({
                    index: i,
                    isOpen: true
                });
            } else if (tokenText[i] === this.delimiters.end) {
                token.delimiters.push({
                    index: i,
                    isOpen: false
                });
            }
        }
        if (token.delimiters.length) {
            token.type = TokenType.Delimiter;
            return token;
        }

        // simple text tokens
        token.type = TokenType.Text;
        return token;
    }    
}