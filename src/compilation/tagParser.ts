import { Delimiters } from '../delimiters';
import { MissingArgumentError, MissingCloseDelimiterError, MissingStartDelimiterError } from '../errors';
import { DocxParser } from '../office';
import { Regex } from '../utils';
import { DelimiterMark } from './delimiterMark';
import { Tag, TagDisposition } from './tag';

export class TagParser {

    private readonly tagRegex: RegExp;

    constructor(
        private readonly docParser: DocxParser,
        private readonly delimiters: Delimiters
    ) {
        if (!docParser)
            throw new MissingArgumentError(nameof(docParser));
        if (!delimiters)
            throw new MissingArgumentError(nameof(delimiters));

        this.tagRegex = new RegExp(`^${Regex.escape(delimiters.tagStart)}(.*?)${Regex.escape(delimiters.tagEnd)}`, 'm');
    }

    public parse(delimiters: DelimiterMark[]): Tag[] {
        const tags: Tag[] = [];

        let openedTag: Partial<Tag>;
        let openedDelimiter: DelimiterMark;
        for (let i = 0; i < delimiters.length; i++) {
            const delimiter = delimiters[i];

            // close before open
            if (!openedTag && !delimiter.isOpen) {
                const closeTagText = delimiter.xmlTextNode.textContent;
                throw new MissingStartDelimiterError(closeTagText);
            }

            // open before close
            if (openedTag && delimiter.isOpen) {
                const openTagText = openedDelimiter.xmlTextNode.textContent;
                throw new MissingCloseDelimiterError(openTagText);
            }

            // valid open
            if (!openedTag && delimiter.isOpen) {
                openedTag = {};
                openedDelimiter = delimiter;
            }

            // valid close
            if (openedTag && !delimiter.isOpen) {

                // normalize the underlying xml structure
                // (make sure the tag's node only includes the tag's text)
                this.normalizeTagNodes(openedDelimiter, delimiter, i, delimiters);
                openedTag.xmlTextNode = openedDelimiter.xmlTextNode;

                // extract tag info from tag's text
                this.processTag(openedTag as Tag);
                tags.push(openedTag as Tag);
                openedTag = null;
                openedDelimiter = null;
            }
        }

        return tags;
    }

    /**
     * Consolidate all tag's text into a single text node.
     *
     * Example:
     *
     * Text node before: "some text {some tag} some more text"
     * Text nodes after: [ "some text ", "{some tag}", " some more text" ]
     */
    private normalizeTagNodes(
        openDelimiter: DelimiterMark,
        closeDelimiter: DelimiterMark,
        closeDelimiterIndex: number,
        allDelimiters: DelimiterMark[]
    ): void {

        let startTextNode = openDelimiter.xmlTextNode;
        let endTextNode = closeDelimiter.xmlTextNode;
        const sameNode = (startTextNode === endTextNode);

        // trim start
        if (openDelimiter.index > 0) {
            this.docParser.splitTextNode(startTextNode, openDelimiter.index, true);
            if (sameNode) {
                closeDelimiter.index -= openDelimiter.index;
            }
        }

        // trim end
        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            endTextNode = this.docParser.splitTextNode(endTextNode, closeDelimiter.index + this.delimiters.tagEnd.length, true);
            if (sameNode) {
                startTextNode = endTextNode;
            }
        }

        // join nodes
        if (!sameNode) {
            this.docParser.joinTextNodesRange(startTextNode, endTextNode);
            endTextNode = startTextNode;
        }

        // update offsets of next delimiters
        for (let i = closeDelimiterIndex + 1; i < allDelimiters.length; i++) {

            let updated = false;
            const curDelimiter = allDelimiters[i];

            if (curDelimiter.xmlTextNode === openDelimiter.xmlTextNode) {
                curDelimiter.index -= openDelimiter.index;
                updated = true;
            }

            if (curDelimiter.xmlTextNode === closeDelimiter.xmlTextNode) {
                curDelimiter.index -= closeDelimiter.index + this.delimiters.tagEnd.length;
                updated = true;
            }

            if (!updated)
                break;
        }

        // update references
        openDelimiter.xmlTextNode = startTextNode;
        closeDelimiter.xmlTextNode = endTextNode;
    }

    private processTag(tag: Tag): void {
        tag.rawText = tag.xmlTextNode.textContent;

        const tagParts = this.tagRegex.exec(tag.rawText);
        const tagContent = (tagParts[1] || '').trim();
        if (!tagContent || !tagContent.length) {
            tag.disposition = TagDisposition.SelfClosed;
            return;
        }

        if (tagContent.startsWith(this.delimiters.containerTagOpen)) {
            tag.disposition = TagDisposition.Open;
            tag.name = tagContent.slice(this.delimiters.containerTagOpen.length).trim();

        } else if (tagContent.startsWith(this.delimiters.containerTagClose)) {
            tag.disposition = TagDisposition.Close;
            tag.name = tagContent.slice(this.delimiters.containerTagClose.length).trim();

        } else {
            tag.disposition = TagDisposition.SelfClosed;
            tag.name = tagContent;
        }
    }
}
