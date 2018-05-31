import { MissingCloseDelimiterError, MissingStartDelimiterError, UnclosedTagError, UnopenedTagError } from '../errors';
import { Tag, TagDisposition } from './tag';
import { TagTree } from './tagTree';
import { TemplateToken, TokenType } from './templateToken';

export class TagTreeComposer {

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
                tags.push(new Tag({ startNode: currentToken.xmlNode }));
                isOpened = true;
            }

            // valid close
            if (isOpened && currentToken.type === TokenType.DelimiterEnd) {
                const lastTag = tags[tags.length - 1];
                lastTag.endNode = currentToken.xmlNode;
                this.fillTagDetails(lastTag);
                isOpened = false;
            }
        }

        return tags;
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
                tagsTree.push(currentParent);

                // set new tag's parent
                if (currentParent) {
                    currentTag.parent = currentParent;
                    currentParent.children.push(currentTag);
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

    private fillTagDetails(tag: Tag): void {
        // TODO: fill tag types
    }
}