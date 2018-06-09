import { DocxParser } from '../docxParser';
import { MissingCloseDelimiterError, MissingStartDelimiterError } from '../errors';
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
                openedTag = new Tag({ xmlTextNode: delimiter.xmlTextNode });
                openedDelimiter = delimiter;
            }

            // valid close
            if (openedTag && !delimiter.isOpen) {
                this.processTag(openedTag, openedDelimiter, delimiter);
                tags.push(openedTag);
                openedTag = null;
                openedDelimiter = null;
            }
        }

        return tags;
    }

    private processTag(tag: Tag, openedDelimiter: DelimiterMark, closeDelimiter: DelimiterMark): void {

        // normalize the underlying xml structure
        const openNode = tag.xmlTextNode;
        const closeNode = closeDelimiter.xmlTextNode;
        this.normalizeTagNodes(openNode, openedDelimiter, closeNode, closeDelimiter);

        // extract tag info from tag's text
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
    }

    /**
     * Consolidate all tag's text into a single text node.
     * 
     * Example: 
     * 
     * Input text: "some text {some tag} some more text" 
     * Output text nodes: [ "some text ", "{tag1}", " some more text" ]
     * 
     * @param startTextNode 
     * @param openDelimiter 
     * @param endTextNode 
     * @param closeDelimiter 
     */
    private normalizeTagNodes(openDelimiter: DelimiterMark, closeDelimiter: DelimiterMark): void {

        if (openDelimiter.index > 0) {
            this.docParser.splitTextNode(startTextNode, openDelimiter.index, true);
        }

        if (closeDelimiter.index < endTextNode.textContent.length - 1) {
            this.docParser.splitTextNode(endTextNode, closeDelimiter.index, false);
        }

        if (startTextNode !== endTextNode) {
            this.docParser.joinTextNodes(startTextNode, endTextNode);
        }
    }
}