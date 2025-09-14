import JSON5 from "json5";
import { Delimiters } from "src/delimiters";
import { InternalArgumentMissingError, InternalError, MissingCloseDelimiterError, MissingStartDelimiterError, TagOptionsParseError } from "src/errors";
import { officeMarkup } from "src/office";
import { normalizeDoubleQuotes } from "src/utils";
import { AttributeDelimiterMark, DelimiterMark, TextNodeDelimiterMark } from "./delimiters";
import { AttributeTag, Tag, TagDisposition, TagPlacement, TextNodeTag } from "./tag";
import { tagRegex } from "./tagUtils";

export class TagParser {

    private readonly tagRegex: RegExp;
    private readonly delimiters: Delimiters;

    constructor(delimiters: Delimiters) {
        if (!delimiters)
            throw new InternalArgumentMissingError("delimiters");

        this.delimiters = delimiters;
        this.tagRegex = tagRegex(delimiters);
    }

    public parse(delimiters: DelimiterMark[]): Tag[] {
        const tags: Tag[] = [];

        let openedDelimiter: DelimiterMark;
        for (let i = 0; i < delimiters.length; i++) {
            const delimiter = delimiters[i];

            // Close before open
            if (!openedDelimiter && !delimiter.isOpen) {
                const closeTagText = this.getPartialTagText(delimiter);
                throw new MissingStartDelimiterError(closeTagText);
            }

            // Open before close
            if (openedDelimiter && delimiter.isOpen) {
                const openTagText = this.getPartialTagText(openedDelimiter);
                throw new MissingCloseDelimiterError(openTagText);
            }

            // Valid open
            if (!openedDelimiter && delimiter.isOpen) {
                openedDelimiter = delimiter;
            }

            // Valid close
            if (openedDelimiter && !delimiter.isOpen) {

                // Create the tag
                const partialTag = this.processDelimiterPair(openedDelimiter, delimiter, i, delimiters);
                const tag = this.populateTagFields(partialTag);
                tags.push(tag);
                openedDelimiter = null;
            }
        }

        return tags;
    }

    private getPartialTagText(delimiter: DelimiterMark): string {
        if (delimiter.placement === TagPlacement.TextNode) {
            return delimiter.xmlTextNode.textContent;
        }

        if (delimiter.placement === TagPlacement.Attribute) {
            return delimiter.xmlNode.attributes[delimiter.attributeName];
        }

        throw new Error(`Unexpected delimiter placement value "${(delimiter as any).placement}"`);
    }

    private processDelimiterPair(openDelimiter: DelimiterMark, closeDelimiter: DelimiterMark, closeDelimiterIndex: number, allDelimiters: DelimiterMark[]): Partial<Tag> {

        if (openDelimiter.placement === TagPlacement.TextNode && closeDelimiter.placement === TagPlacement.TextNode) {
            return this.processTextNodeDelimiterPair(openDelimiter, closeDelimiter, closeDelimiterIndex, allDelimiters);
        }

        if (openDelimiter.placement === TagPlacement.Attribute && closeDelimiter.placement === TagPlacement.Attribute) {
            return this.processAttributeDelimiterPair(openDelimiter, closeDelimiter);
        }

        throw new Error(`Unexpected delimiter placement values. Open delimiter: "${openDelimiter.placement}", Close delimiter: "${closeDelimiter.placement}"`);
    }

    private processTextNodeDelimiterPair(openDelimiter: TextNodeDelimiterMark, closeDelimiter: TextNodeDelimiterMark, closeDelimiterIndex: number, allDelimiters: DelimiterMark[]): Partial<TextNodeTag> {

        // Normalize the underlying xml structure
        // (make sure the tag's node only includes the tag's text)
        this.normalizeTextTagNodes(openDelimiter, closeDelimiter, closeDelimiterIndex, allDelimiters);

        const tag: Partial<TextNodeTag> = {
            placement: TagPlacement.TextNode,
            xmlTextNode: openDelimiter.xmlTextNode,
            rawText: openDelimiter.xmlTextNode.textContent
        };
        return tag;
    }

    private processAttributeDelimiterPair(openDelimiter: AttributeDelimiterMark, closeDelimiter: AttributeDelimiterMark): Partial<AttributeTag> {
        const attrValue = openDelimiter.xmlNode.attributes[openDelimiter.attributeName];
        const tagText = attrValue.substring(openDelimiter.index, closeDelimiter.index + this.delimiters.tagEnd.length);

        const tag: Partial<AttributeTag> = {
            placement: TagPlacement.Attribute,
            xmlNode: openDelimiter.xmlNode,
            attributeName: openDelimiter.attributeName,
            rawText: tagText,
        };
        return tag;
    }

    /**
     * Consolidate all tag's text into a single text node.
     *
     * Example:
     *
     * Text node before: "some text {some tag} some more text"
     * Text nodes after: [ "some text ", "{some tag}", " some more text" ]
     */
    private normalizeTextTagNodes(
        openDelimiter: TextNodeDelimiterMark,
        closeDelimiter: TextNodeDelimiterMark,
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

        // Trim start
        if (openDelimiter.index > 0) {
            officeMarkup.modify.splitTextNode(startTextNode, openDelimiter.index, true);
            if (sameNode) {
                closeDelimiter.index -= openDelimiter.index;
            }
        }

        // Trim end
        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            endTextNode = officeMarkup.modify.splitTextNode(endTextNode, closeDelimiter.index + this.delimiters.tagEnd.length, true);
            if (sameNode) {
                startTextNode = endTextNode;
            }
        }

        // Join nodes
        if (!sameNode) {
            officeMarkup.modify.joinTextNodesRange(startTextNode, endTextNode);
            endTextNode = startTextNode;
        }

        // Update offsets of next delimiters
        for (let i = closeDelimiterIndex + 1; i < allDelimiters.length; i++) {

            let updated = false;
            const curDelimiter = allDelimiters[i];

            if (curDelimiter.placement === TagPlacement.TextNode && curDelimiter.xmlTextNode === openDelimiter.xmlTextNode) {
                curDelimiter.index -= openDelimiter.index;
                updated = true;
            }

            if (curDelimiter.placement === TagPlacement.TextNode && curDelimiter.xmlTextNode === closeDelimiter.xmlTextNode) {
                curDelimiter.index -= closeDelimiter.index + this.delimiters.tagEnd.length;
                updated = true;
            }

            if (!updated)
                break;
        }

        // Update references
        openDelimiter.xmlTextNode = startTextNode;
        closeDelimiter.xmlTextNode = endTextNode;
    }

    private populateTagFields(partialTag: Partial<Tag>): Tag {
        if (!partialTag.rawText) {
            throw new InternalError("tag.rawText is required");
        }
        const tag = partialTag as Tag;

        const tagParts = tag.rawText.match(this.tagRegex);
        const tagName = (tagParts.groups?.["tagName"] || '').trim();

        // Ignoring empty tags
        if (!tagName?.length) {
            tag.disposition = TagDisposition.SelfClosed;
            return tag;
        }

        // Tag options
        const tagOptionsText = (tagParts.groups?.["tagOptions"] || '').trim();
        if (tagOptionsText) {
            try {
                tag.options = JSON5.parse("{" + normalizeDoubleQuotes(tagOptionsText) + "}");
            } catch (e) {
                throw new TagOptionsParseError(tag.rawText, e);
            }
        }

        // Container open tag
        if (tagName.startsWith(this.delimiters.containerTagOpen)) {
            tag.disposition = TagDisposition.Open;
            tag.name = tagName.slice(this.delimiters.containerTagOpen.length).trim();
            return tag;
        }

        // Container close tag
        if (tagName.startsWith(this.delimiters.containerTagClose)) {
            tag.disposition = TagDisposition.Close;
            tag.name = tagName.slice(this.delimiters.containerTagClose.length).trim();
            return tag;
        }

        // Self-closed tag
        tag.disposition = TagDisposition.SelfClosed;
        tag.name = tagName;
        return tag;
    }
}
