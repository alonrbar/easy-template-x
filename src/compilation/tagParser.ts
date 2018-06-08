import { Delimiters } from '../delimiters';
import { DocxParser } from '../docxParser';
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
    public docParser = new DocxParser();

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
                        openedTag = new Tag({ xmlTextNode: currentToken.xmlTextNode });
                        openedDelimiter = delimiter;
                    }

                    // valid close
                    if (openedTag && !delimiter.isOpen) {
                        this.processTag(openedTag, openedDelimiter, currentToken, delimiter);
                        tags.push(openedTag);
                        openedTag = null;
                        openedDelimiter = null;
                    }
                }
            }
        }

        return tags;
    }

    private processTag(tag: Tag, openedDelimiter: DelimiterMark, closeToken: TemplateToken, closeDelimiter: DelimiterMark): void {

        // normalize the underlying xml structure
        const openNode = tag.xmlTextNode;
        const closeNode = closeToken.xmlTextNode;
        this.normalizeTagNodes(openNode, openedDelimiter, closeNode, closeDelimiter);

        // extract tag info from tag's text
        tag.rawText = tag.xmlTextNode.textContent;
        for (const prefix of this.tagPrefix) {

            // TODO: compile regex once
            const pattern = `^[${this.delimiters.start}](\\s*?)${prefix.prefix}(.*?)[${this.delimiters.end}]`;
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

    private normalizeTagNodes(startTextNode: XmlNode, openDelimiter: DelimiterMark, endTextNode: XmlNode, closeDelimiter: DelimiterMark): void {

        // for this text: "some text {my tag} some other text" 
        // the desired text nodes should be:
        // [ "some text ", "{my tag}", " some other text" ]

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