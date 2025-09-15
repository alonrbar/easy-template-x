import JSON5 from "json5";
import { Delimiters } from "src/delimiters";
import { InternalArgumentMissingError, InternalError, MissingCloseDelimiterError, MissingStartDelimiterError, TagOptionsParseError } from "src/errors";
import { officeMarkup, OmlNode } from "src/office";
import { normalizeDoubleQuotes } from "src/utils";
import { XmlNode } from "src/xml";
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

        let openedTextDelimiter: DelimiterMark;
        let openedAttributeDelimiter: DelimiterMark;
        for (let i = 0; i < delimiters.length; i++) {

            if (delimiters[i].placement === TagPlacement.TextNode) {
                openedTextDelimiter = this.processDelimiter(delimiters, i, openedTextDelimiter, tags);
                continue;
            }
            
            if (delimiters[i].placement === TagPlacement.Attribute) {
                openedAttributeDelimiter = this.processDelimiter(delimiters, i, openedAttributeDelimiter, tags);
                continue;
            }
            
            throw new Error(`Unexpected delimiter placement value "${(delimiters[i] as any).placement}"`);
        }

        return tags;
    }

    private processDelimiter(delimiters: DelimiterMark[], i: number, openedDelimiter: DelimiterMark, tags: Tag[]): DelimiterMark {
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

        return openedDelimiter;
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

        // Verify tag delimiters are in the same paragraph
        const openTextNode = openDelimiter.xmlTextNode;
        const closeTextNode = closeDelimiter.xmlTextNode;
        const sameNode = (openTextNode === closeTextNode);
        if (!sameNode) {
            const startParagraph = officeMarkup.query.containingParagraphNode(openTextNode);
            const endParagraph = officeMarkup.query.containingParagraphNode(closeTextNode);
            if (startParagraph !== endParagraph) {
                throw new MissingCloseDelimiterError(openTextNode.textContent);
            }
        }

        // Verify no inline drawing in the middle
        const startRun = officeMarkup.query.containingRunNode(openTextNode);
        const endRun = officeMarkup.query.containingRunNode(closeTextNode);
        let currentRun: XmlNode = startRun;
        while (currentRun && currentRun !== endRun) {
            const drawing = currentRun.childNodes?.find(child => child.nodeName === OmlNode.W.Drawing);
            if (!drawing) {
                currentRun = currentRun.nextSibling;
                continue;
            }

            const inline = drawing.childNodes?.find(child => child.nodeName === OmlNode.Wp.Inline);
            if (!inline) {
                currentRun = currentRun.nextSibling;
                continue;
            }

            throw new MissingCloseDelimiterError(openTextNode.textContent);
        }

        // Normalize the underlying xml structure
        // (make sure the tag's node only includes the tag's text)
        this.normalizeTextTagNodes(openDelimiter, closeDelimiter, closeDelimiterIndex, allDelimiters);

        // Create the tag
        const tag: Partial<TextNodeTag> = {
            placement: TagPlacement.TextNode,
            xmlTextNode: openDelimiter.xmlTextNode,
            rawText: openDelimiter.xmlTextNode.textContent
        };
        return tag;
    }

    private processAttributeDelimiterPair(openDelimiter: AttributeDelimiterMark, closeDelimiter: AttributeDelimiterMark): Partial<AttributeTag> {

        // Verify tag delimiters are in the same attribute
        const openNode = openDelimiter.xmlNode;
        const closeNode = closeDelimiter.xmlNode;
        if (openNode !== closeNode) {
            throw new MissingCloseDelimiterError(openNode.attributes[openDelimiter.attributeName]);
        }
        if (openDelimiter.attributeName !== closeDelimiter.attributeName) {
            throw new MissingCloseDelimiterError(openNode.attributes[openDelimiter.attributeName]);
        }

        // Create the tag
        const attrValue = openNode.attributes[openDelimiter.attributeName];
        const tagText = attrValue.substring(openDelimiter.index, closeDelimiter.index + this.delimiters.tagEnd.length);

        const tag: Partial<AttributeTag> = {
            placement: TagPlacement.Attribute,
            xmlNode: openNode,
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
