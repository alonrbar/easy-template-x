import { DocxParser } from '../docxParser';
import { MissingCloseDelimiterError, MissingStartDelimiterError, UnknownPrefixError } from '../errors';
import { XmlTextNode } from '../xmlNode';
import { DelimiterMark } from './delimiterMark';
import { Tag, TagDisposition, TagType } from './tag';
import { TagPrefix } from './tagPrefix';

export class TagParser {

    // TODO: get from outside    
    public startDelimiter = "{";
    public endDelimiter = "}";
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
    public docParser = new DocxParser();

    public parse(delimiters: DelimiterMark[]): Tag[] {
        const tags: Tag[] = [];

        let openedTag: Tag;
        let openedDelimiter: DelimiterMark;
        let lastNormalizedNode: XmlTextNode;
        let lastInflictedOffset: number;
        for (const delimiter of delimiters) {

            // close before open
            if (!openedTag && !delimiter.isOpen) {
                // TODO: extract tag name
                throw new MissingStartDelimiterError('Unknown');
            }

            // open before close
            if (openedTag && delimiter.isOpen) {
                // TODO: extract tag name
                throw new MissingCloseDelimiterError('Unknown');
            }

            // valid open
            if (!openedTag && delimiter.isOpen) {
                openedTag = new Tag();
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
                this.processTag(openedTag);
                tags.push(openedTag);
                openedTag = null;
                openedDelimiter = null;
            }
        }

        return tags;
    }

    private processTag(tag: Tag): void {
        tag.rawText = tag.xmlTextNode.textContent;
        for (const prefix of this.tagPrefix) {

            // TODO: compile regex once
            const pattern = `^[${this.startDelimiter}](\\s*?)${prefix.prefix}(.*?)[${this.endDelimiter}]`;
            const regex = new RegExp(pattern, 'gmi');

            const match = regex.exec(tag.rawText);
            if (match && match.length) {
                tag.name = match[2];
                tag.type = prefix.tagType;
                tag.disposition = prefix.tagDisposition;
                break;
            }
        }

        if (!tag.name)
            throw new UnknownPrefixError(tag.rawText);
    }

    /**
     * Consolidate all tag's text into a single text node.
     * 
     * Example: 
     * 
     * Input text node: "some text {some tag} some more text" 
     * Output text nodes: [ "some text ", "{tag1}", " some more text" ]
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
            this.docParser.joinTextNodes(startTextNode, endTextNode);
            endTextNode = startTextNode;
        }

        // update references
        openDelimiter.xmlTextNode = startTextNode;
        closeDelimiter.xmlTextNode = endTextNode;

        // return the created offset
        return inflictedOffset;
    }    
}