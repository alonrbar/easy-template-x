import { expect } from 'chai';
import { DelimiterMark } from 'src/compilation/delimiterMark';
import { TagDisposition } from 'src/compilation/tag';
import { TagParser } from 'src/compilation/tagParser';
import { XmlTextNode } from 'src/xmlNode';
import { parseXml } from '../testUtils';

describe(nameof(TagParser), () => {

    it('parses correctly multiple tags on the same text node', () => {

        const paragraph = parseXml(`
            <w:p>
                <w:r>
                    <w:t>{#loop}{/loop}</w:t>
                </w:r>
            </w:p>
        `);

        const textNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
        const delimiters: DelimiterMark[] = [
            {
                isOpen: true,
                index: 0,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 6,
                xmlTextNode: textNode
            },
            {
                isOpen: true,
                index: 7,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 13,
                xmlTextNode: textNode
            }
        ];

        const parser = new TagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).to.eql(2);

        // open tag
        expect(tags[0].disposition).to.eql(TagDisposition.Open);
        expect(tags[0].name).to.eql('loop');
        expect(tags[0].rawText).to.eql('{#loop}');

        // close tag
        expect(tags[1].disposition).to.eql(TagDisposition.Close);
        expect(tags[1].name).to.eql('loop');
        expect(tags[1].rawText).to.eql('{/loop}');
    });

    it('parses correctly a butterfly }{', () => {

        const paragraphNode = parseXml(`
            <w:p>
                <w:r>
                    <w:t>{#loop</w:t>
                    <w:t>}{</w:t>
                    <w:t>/loop}</w:t>
                </w:r>
            </w:p>
        `);
        const runNode = paragraphNode.childNodes[0];

        const firstTextNode = runNode.childNodes[0].childNodes[0] as XmlTextNode;
        const secondTextNode = runNode.childNodes[1].childNodes[0] as XmlTextNode;
        const thirdTextNode = runNode.childNodes[2].childNodes[0] as XmlTextNode;
        const delimiters: DelimiterMark[] = [
            {
                isOpen: true,
                index: 0,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: false,
                index: 0,
                xmlTextNode: secondTextNode
            },
            {
                isOpen: true,
                index: 1,
                xmlTextNode: secondTextNode
            },
            {
                isOpen: false,
                index: 5,
                xmlTextNode: thirdTextNode
            }
        ];

        const parser = new TagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).to.eql(2);

        // open tag
        expect(tags[0].disposition).to.eql(TagDisposition.Open);
        expect(tags[0].name).to.eql('loop');
        expect(tags[0].rawText).to.eql('{#loop}');

        // close tag
        expect(tags[1].disposition).to.eql(TagDisposition.Close);
        expect(tags[1].name).to.eql('loop');
        expect(tags[1].rawText).to.eql('{/loop}');
    });

    it('parses correctly a splitted simple tag', () => {

        const paragraphNode = parseXml(`
            <w:p>
                <w:r>
                    <w:t>{#loo</w:t>
                    <w:t>p}</w:t>
                </w:r>
            </w:p>
        `);
        const runNode = paragraphNode.childNodes[0];

        const firstTextNode = runNode.childNodes[0].childNodes[0] as XmlTextNode;
        const secondTextNode = runNode.childNodes[1].childNodes[0] as XmlTextNode;
        const delimiters: DelimiterMark[] = [
            {
                isOpen: true,
                index: 0,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: false,
                index: 1,
                xmlTextNode: secondTextNode
            }
        ];

        const parser = new TagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).to.eql(1);

        // tag
        expect(tags[0].disposition).to.eql(TagDisposition.Open);
        expect(tags[0].name).to.eql('loop');
        expect(tags[0].rawText).to.eql('{#loop}');
    });

});