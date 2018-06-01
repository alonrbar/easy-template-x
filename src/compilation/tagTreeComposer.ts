import { Delimiters } from '../delimiters';
import { MissingCloseDelimiterError, MissingStartDelimiterError, UnclosedTagError, UnopenedTagError } from '../errors';
import { Tag, TagDisposition, TagType } from './tag';
import { TagPrefix } from './tagPrefix';
import { TagTree } from './tagTree';
import { TemplateToken, TokenType } from './templateToken';

export class TagTreeComposer {

    // TODO: get from outside
    public tagPrefix: TagPrefix[] = [
        {
            prefix: '#',
            tagType: TagType.Loop,
            tagDisposition: TagDisposition.Open
        },
        {
            prefix: '/',
            tagType: TagType.Loop,
            tagDisposition: TagDisposition.Close
        },
        {
            prefix: '',
            tagType: TagType.Simple,
            tagDisposition: TagDisposition.SelfClosed
        }
    ];
    public delimiters = new Delimiters();

    public composeTree(tokens: TemplateToken[]): TagTree[] {
        const allTags = this.tokensToTags(tokens);
        const tagsTree = this.createTagTree(allTags);
        return tagsTree;
    }

    private tokensToTags(tokens: TemplateToken[]): Tag[] {
        const tags: Tag[] = [];

        let isOpened = false;
        for (const currentToken of tokens) {

            // close before open
            if (!isOpened && currentToken.type === TokenType.DelimiterEnd) {
                // TODO: extract tag name
                throw new MissingStartDelimiterError('tag name...');
            }

            // open before close
            if (isOpened && currentToken.type === TokenType.DelimiterStart) {
                // TODO: extract tag name
                throw new MissingCloseDelimiterError('tag name...');
            }

            // valid open
            if (!isOpened && currentToken.type === TokenType.DelimiterStart) {
                tags.push(new Tag({
                    startToken: currentToken,
                    startNode: currentToken.xmlNode
                }));
                isOpened = true;
            }

            // valid close
            if (isOpened && currentToken.type === TokenType.DelimiterEnd) {
                const lastTag = tags[tags.length - 1];
                lastTag.endToken = currentToken;
                lastTag.endNode = currentToken.xmlNode;
                this.fillTagDetails(lastTag);
                isOpened = false;
            }
        }

        return tags;
    }

    private fillTagDetails(tag: Tag): void {
        tag.rawText = this.getRawTagText(tag);
        for (const prefix of this.tagPrefix) {

            // TODO: compile regex once
            const pattern = `[${this.delimiters.start}](\\s*?)${prefix.prefix}(.*?)[${this.delimiters.end}]`;
            const regex = new RegExp(pattern, 'gmi');
            
            const match = regex.exec(tag.rawText);
            if (match && match.length) {
                tag.name = match[2];
                tag.type = prefix.tagType;
                tag.disposition = prefix.tagDisposition;
                break;
            }
        }
    }

    private getRawTagText(tag: Tag): string {

        let rawTextBuilder: string[] = [];
        let token = tag.startToken;
        while (token) {

            // current token text
            let tokenText = token.xmlNode.textContent;

            // trim before or after delimiter
            if (typeof token.delimiterIndex === 'number') {
                if (token.type === TokenType.DelimiterStart) {
                    tokenText = tokenText.substring(token.delimiterIndex);
                } else if (token.type === TokenType.DelimiterEnd) {
                    tokenText = tokenText.substring(0, token.delimiterIndex + 1);
                }
            }

            // push and next
            rawTextBuilder.push(tokenText);

            if (token === tag.endToken) {
                token = null;
            } else {
                token = token.next;
            }
        }

        return rawTextBuilder.join('');
    }

    private createTagTree(allTags: Tag[]): TagTree[] {
        if (!allTags.length)
            return [];

        const tagsTree: TagTree[] = [];

        let currentParent: TagTree;
        for (const rawTag of allTags) {

            const isOpening = (rawTag.disposition === TagDisposition.Open);
            const isClosing = (rawTag.disposition === TagDisposition.Close);
            const isSelfClosing = (rawTag.disposition === TagDisposition.SelfClosed);

            if (isOpening || isSelfClosing) {

                // create new TagTree node
                const currentTag = new TagTree({
                    type: rawTag.type,
                    name: rawTag.name,
                    startNode: rawTag.startNode
                });
                if (isSelfClosing) {
                    currentTag.endNode = rawTag.endNode;
                }

                // add to the tree
                if (currentParent) {
                    currentTag.parent = currentParent;
                    currentParent.children.push(currentTag);
                } else {
                    tagsTree.push(currentTag);
                }

                // update current parent pointer
                if (isOpening) {
                    currentParent = currentTag;
                }
            }

            // close tree branch
            if (isClosing) {
                if (!currentParent)
                    throw new UnopenedTagError(rawTag.name);

                currentParent.endNode = rawTag.endNode;
                currentParent = currentParent.parent;
            }
        }

        if (currentParent)
            throw new UnclosedTagError(currentParent.name);

        return tagsTree;
    }
}