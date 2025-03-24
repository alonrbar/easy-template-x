import JSON5 from "json5";
import { Delimiters } from "src/delimiters";
import { InternalArgumentMissingError, MissingCloseDelimiterError, MissingStartDelimiterError, TagOptionsParseError } from "src/errors";
import { officeMarkup } from "src/office";
import { normalizeDoubleQuotes, Regex } from "src/utils";
import { DelimiterMark } from "./delimiterMark";
import { Tag, TagDisposition } from "./tag";

export class TagParser {

    private readonly tagRegex: RegExp;
    private readonly delimiters: Delimiters;

    constructor(delimiters: Delimiters) {
        if (!delimiters)
            throw new InternalArgumentMissingError(nameof(delimiters));

        this.delimiters = delimiters;

        const tagOptionsRegex = `${Regex.escape(delimiters.tagOptionsStart)}(?<tagOptions>.*?)${Regex.escape(delimiters.tagOptionsEnd)}`;
        this.tagRegex = new RegExp(`^${Regex.escape(delimiters.tagStart)}(?<tagName>.*?)(${tagOptionsRegex})?${Regex.escape(delimiters.tagEnd)}`, 'm');
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

        if (!sameNode) {
            const startParagraph = officeMarkup.query.containingParagraphNode(startTextNode);
            const endParagraph = officeMarkup.query.containingParagraphNode(endTextNode);
            if (startParagraph !== endParagraph) {
                throw new MissingCloseDelimiterError(startTextNode.textContent);
            }
        }

        // trim start
        if (openDelimiter.index > 0) {
            officeMarkup.modify.splitTextNode(startTextNode, openDelimiter.index, true);
            if (sameNode) {
                closeDelimiter.index -= openDelimiter.index;
            }
        }

        // trim end
        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            endTextNode = officeMarkup.modify.splitTextNode(endTextNode, closeDelimiter.index + this.delimiters.tagEnd.length, true);
            if (sameNode) {
                startTextNode = endTextNode;
            }
        }

        // join nodes
        if (!sameNode) {
            officeMarkup.modify.joinTextNodesRange(startTextNode, endTextNode);
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
        const tagName = (tagParts.groups?.["tagName"] || '').trim();

        // Ignoring empty tags.
        if (!tagName?.length) {
            tag.disposition = TagDisposition.SelfClosed;
            return;
        }

        // Tag options.
        const tagOptionsText = (tagParts.groups?.["tagOptions"] || '').trim();
        if (tagOptionsText) {
            try {
                tag.options = JSON5.parse("{" + normalizeDoubleQuotes(tagOptionsText) + "}");
            } catch (e) {
                throw new TagOptionsParseError(tag.rawText, e);
            }
        }

        // Container open tag.
        if (tagName.startsWith(this.delimiters.containerTagOpen)) {
            tag.disposition = TagDisposition.Open;
            tag.name = tagName.slice(this.delimiters.containerTagOpen.length).trim();
            return;
        }

        // Container close tag.
        if (tagName.startsWith(this.delimiters.containerTagClose)) {
            tag.disposition = TagDisposition.Close;
            tag.name = tagName.slice(this.delimiters.containerTagClose.length).trim();
            return;
        }

        // Self-closed tag.
        tag.disposition = TagDisposition.SelfClosed;
        tag.name = tagName;
    }
}
