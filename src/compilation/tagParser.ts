import { Delimiters } from '../delimiters';
import { MissingCloseDelimiterError, MissingStartDelimiterError } from '../errors';
import { Tag, TagDisposition, TagType } from './tag';
import { TagPrefix } from './tagPrefix';
import { DelimiterMark, TemplateToken, TokenType } from './templateToken';

export class TagParser {
   
    // TODO: get from outside
    public tagPrefix: TagPrefix[] = [
        {
            prefix: '#',
            tagType: TagType.Loop,
            tagDisposition: TagDisposition.Opened
        },
        {
            prefix: '/',
            tagType: TagType.Loop,
            tagDisposition: TagDisposition.Closed
        },
        {
            prefix: '',
            tagType: TagType.Simple,
            tagDisposition: TagDisposition.SelfClosed
        }
    ];
    public delimiters = new Delimiters();

    public parse(tokens: TemplateToken[]): Tag[] {
        const tags: Tag[] = [];

        let openedTag: Tag;
        let openedDelimiter: DelimiterMark;
        for (const currentToken of tokens) {

            if (currentToken.type === TokenType.Delimiter) {
                for (const delimiter of currentToken.delimiters) {

                    // close before open
                    if (!openedTag && !delimiter.isOpen) {
                        // TODO: extract tag name
                        throw new MissingStartDelimiterError('tag name...');
                    }

                    // open before close
                    if (openedTag && delimiter.isOpen) {
                        // TODO: extract tag name
                        throw new MissingCloseDelimiterError('tag name...');
                    }

                    // valid open
                    if (!openedTag && delimiter.isOpen) {
                        openedTag = new Tag({ xmlNode: currentToken.xmlNode });
                        openedDelimiter = delimiter;
                    }

                    // valid close
                    if (openedTag && !delimiter.isOpen) {
                        this.processTag(openedTag, openedDelimiter, currentToken, delimiter);
                        openedTag = null;
                        openedDelimiter = null;
                    }
                }
            }
        }

        return tags;
    }

    private processTag(openedTag: Tag, openedDelimiter: DelimiterMark, closeToken: TemplateToken, closeDelimiter: DelimiterMark): void {

        let openNode = openedTag.xmlNode;
        let closeNode = closeToken.xmlNode;
        // let tagNode: Node;

        this.normalizeTagNodes(openNode, openedDelimiter, closeNode, closeDelimiter);

        openedTag.rawText = this.getRawTagText(openedTag);
        for (const prefix of this.tagPrefix) {

            // TODO: compile regex once
            const pattern = `[${this.delimiters.start}](\\s*?)${prefix.prefix}(.*?)[${this.delimiters.end}]`;
            const regex = new RegExp(pattern, 'gmi');

            const match = regex.exec(openedTag.rawText);
            if (match && match.length) {
                openedTag.name = match[2];
                openedTag.type = prefix.tagType;
                openedTag.disposition = prefix.tagDisposition;
                break;
            }
        }
    }

    private getRawTagText(tag: Tag): string {

        let rawTextBuilder: string[] = [];
        // let token = tag.startToken;
        // while (token) {

        //     // current token text
        //     let tokenText = token.xmlNode.textContent;

        //     // trim before or after delimiter
        //     if (typeof token.delimiterIndex === 'number') {
        //         if (token.type === TokenType.Delimiter) {
        //             tokenText = tokenText.substring(token.delimiterIndex);
        //         } else if (token.type === TokenType.DelimiterEnd) {
        //             tokenText = tokenText.substring(0, token.delimiterIndex + 1);
        //         }
        //     }

        //     // push and next
        //     rawTextBuilder.push(tokenText);

        //     if (token === tag.endToken) {
        //         token = null;
        //     } else {
        //         token = token.next;
        //     }
        // }

        return rawTextBuilder.join('');
    }

    private normalizeTagNodes(startTextNode: Node, openDelimiter: DelimiterMark, endTextNode: Node, closeDelimiter: DelimiterMark): Node {

        // for this text: "some text {my tag} some other text" 
        // the desired text nodes should be:
        // [ "some text ", "{my tag}", " some other text" ]

        if (openDelimiter.index > 0) {
            this.splitTextNode(startTextNode, openDelimiter.index, true);
        }

        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            this.splitTextNode(endTextNode, closeDelimiter.index, false);
        }

        if (startTextNode !== endTextNode) {
            this.joinTextNodes(startTextNode, endTextNode);
        }
    }

    private splitTextNode(textNode: Node, splitIndex: number, addBefore: boolean): void {

        let firstTextNode: Node;
        let secondTextNode: Node;

        // split nodes
        const runNode = this.findRunNode(textNode);
        if (addBefore) {

            const beforeRunNode = runNode.cloneNode(true);
            runNode.parentNode.insertBefore(beforeRunNode, runNode);

            firstTextNode = this.findTextNode(beforeRunNode);
            secondTextNode = textNode;

        } else {

            const afterRunNode = runNode.cloneNode(true);
            const runIndex = this.indexOfChildNode(runNode.parentNode, runNode);
            if (runIndex === runNode.parentNode.childNodes.length - 1) {
                runNode.parentNode.appendChild(afterRunNode);
            } else {
                const currentAfterRunNode = runNode.parentNode.childNodes.item(runIndex + 1);
                runNode.parentNode.insertBefore(currentAfterRunNode, afterRunNode);
            }

            firstTextNode = textNode;
            secondTextNode = this.findTextNode(afterRunNode);
        }

        // edit text
        firstTextNode.textContent = firstTextNode.textContent.substring(0, splitIndex);
        secondTextNode.textContent = secondTextNode.textContent.substring(splitIndex);
    }

    private joinTextNodes(first: Node, seconds: Node): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Search **downwards** for the first text node.
     */
    private findTextNode(node: Node): Node {

        if (!node)
            return null;

        if (node.nodeType === node.TEXT_NODE)
            return node;

        if (!node.hasChildNodes())
            return null;

        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes.item(i);
            const textNode = this.findTextNode(childNode);
            if (textNode)
                return textNode;
        }

        return null;
    }

    /**
     * Search **upwards** for the first run node.
     */
    private findRunNode(node: Node): Node {
        if (!node)
            return null;

        if (node.nodeName === 'w:r')
            return node;

        return this.findRunNode(node.parentNode);
    }

    private indexOfChildNode(parent: Node, child: Node): number {
        if (!parent.hasChildNodes())
            return -1;

        for (let i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes.item(i) === child)
                return i;
        }

        return -1;
    }
}