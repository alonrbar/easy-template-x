import { Delimiters } from '../delimiters';
import { DocxParser } from '../docxParser';
import { MissingArgumentError, MissingCloseDelimiterError, MissingStartDelimiterError } from '../errors';
import { XmlTextNode } from '../xmlNode';
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

        this.tagRegex = new RegExp(`^[${delimiters.tagStart}](.*?)[${delimiters.tagEnd}]`, 'mi');
    }

    public parse(delimiters: DelimiterMark[]): Tag[] {
        const tags: Tag[] = [];

        let openedTag: Partial<Tag>;
        let openedDelimiter: DelimiterMark;
        let lastNormalizedNode: XmlTextNode;
        let lastInflictedOffset: number;
        for (const delimiter of delimiters) {

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
                if (lastNormalizedNode === openedDelimiter.xmlTextNode) {
                    openedDelimiter.index -= lastInflictedOffset;
                }
                if (lastNormalizedNode === delimiter.xmlTextNode) {
                    delimiter.index -= lastInflictedOffset;
                }
                lastNormalizedNode = delimiter.xmlTextNode;
                lastInflictedOffset = this.normalizeTagNodes(openedDelimiter, delimiter);
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
     * Input text node: "some text {some tag} some more text" 
     * Output text nodes: [ "some text ", "{some tag}", " some more text" ]
     */
    private normalizeTagNodes(openDelimiter: DelimiterMark, closeDelimiter: DelimiterMark): number {

        // we change the node's text and therefor needs to update following delimiters
        let inflictedOffset = 0;

        let startTextNode = openDelimiter.xmlTextNode;
        let endTextNode = closeDelimiter.xmlTextNode;
        const sameNode = (startTextNode === endTextNode);

        // trim start
        if (openDelimiter.index > 0) {
            inflictedOffset += openDelimiter.index;
            this.docParser.splitTextNode(startTextNode, openDelimiter.index, true);
        }

        // trim end
        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            inflictedOffset += closeDelimiter.index + 1;
            endTextNode = this.docParser.splitTextNode(endTextNode, closeDelimiter.index + 1, true);
            if (sameNode) {
                startTextNode = endTextNode;
            }
        }

        // join nodes
        if (!sameNode) {
            this.docParser.joinTextNodesRange(startTextNode, endTextNode);
            endTextNode = startTextNode;
        }

        // update references
        openDelimiter.xmlTextNode = startTextNode;
        closeDelimiter.xmlTextNode = endTextNode;

        // return the created offset
        return inflictedOffset;
    }

    private processTag(tag: Tag): void {
        tag.rawText = tag.xmlTextNode.textContent;

        const tagParts = this.tagRegex.exec(tag.rawText);
        const tagContent = (tagParts[1] || '').trim();
        if (!tagContent || !tagContent.length) {
            tag.disposition = TagDisposition.SelfClosed;
            // TODO: test empty tag handling
            return;
        }

        if (tagContent[0] === this.delimiters.containerTagOpen) {
            tag.disposition = TagDisposition.Open;
            tag.name = tagContent.slice(1);

        } else if (tagContent[0] === this.delimiters.containerTagClose) {
            tag.disposition = TagDisposition.Close;
            tag.name = tagContent.slice(1);

        } else {
            // note: tag type will be assigned by the TemplateCompiler
            tag.disposition = TagDisposition.SelfClosed;
            tag.name = tagContent;
        }
    }
}