import { DelimiterMark } from 'src/compilation/delimiterMark';
import { TagDisposition } from 'src/compilation/tag';
import { TagParser } from 'src/compilation/tagParser';
import { Delimiters } from 'src/delimiters';
import { DocxParser } from 'src/office';
import { XmlParser, XmlTextNode } from 'src/xml';
import { parseXml } from '../../testUtils';

describe(TagParser, () => {

    test('trim tag names', () => {

        const paragraph = parseXml(`
            <w:p><w:r><w:t>{# my loop  }{ my tag  }{/  my loop }</w:t></w:r></w:p>
        `, false);

        const textNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
        expect(textNode.textContent).toEqual('{# my loop  }{ my tag  }{/  my loop }');

        const delimiters: DelimiterMark[] = [
            {
                isOpen: true,
                index: 0,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 12,
                xmlTextNode: textNode
            },
            {
                isOpen: true,
                index: 13,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 23,
                xmlTextNode: textNode
            },
            {
                isOpen: true,
                index: 24,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 36,
                xmlTextNode: textNode
            }
        ];

        const parser = createTagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).toEqual(3);

        // open tag
        expect(tags[0].disposition).toEqual(TagDisposition.Open);
        expect(tags[0].name).toEqual('my loop');
        expect(tags[0].rawText).toEqual('{# my loop  }');

        // middle tag
        expect(tags[1].disposition).toEqual(TagDisposition.SelfClosed);
        expect(tags[1].name).toEqual('my tag');
        expect(tags[1].rawText).toEqual('{ my tag  }');

        // close tag
        expect(tags[2].disposition).toEqual(TagDisposition.Close);
        expect(tags[2].name).toEqual('my loop');
        expect(tags[2].rawText).toEqual('{/  my loop }');
    });

    test('multiple tags on the same text node', () => {

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

        const parser = createTagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).toEqual(2);

        // open tag
        expect(tags[0].disposition).toEqual(TagDisposition.Open);
        expect(tags[0].name).toEqual('loop');
        expect(tags[0].rawText).toEqual('{#loop}');

        // close tag
        expect(tags[1].disposition).toEqual(TagDisposition.Close);
        expect(tags[1].name).toEqual('loop');
        expect(tags[1].rawText).toEqual('{/loop}');
    });

    test('multiple tags on the same text node, with leading text', () => {

        const paragraph = parseXml(`
            <w:p>
                <w:r>
                    <w:t>text1{#loop}text2{/loop}</w:t>
                </w:r>
            </w:p>
        `);

        const textNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
        const delimiters: DelimiterMark[] = [
            {
                isOpen: true,
                index: 5,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 11,
                xmlTextNode: textNode
            },
            {
                isOpen: true,
                index: 17,
                xmlTextNode: textNode
            },
            {
                isOpen: false,
                index: 23,
                xmlTextNode: textNode
            }
        ];

        const parser = createTagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).toEqual(2);

        // open tag
        expect(tags[0].disposition).toEqual(TagDisposition.Open);
        expect(tags[0].name).toEqual('loop');
        expect(tags[0].rawText).toEqual('{#loop}');

        // close tag
        expect(tags[1].disposition).toEqual(TagDisposition.Close);
        expect(tags[1].name).toEqual('loop');
        expect(tags[1].rawText).toEqual('{/loop}');
    });

    test('parse a butterfly }{', () => {

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

        const parser = createTagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).toEqual(2);

        // open tag
        expect(tags[0].disposition).toEqual(TagDisposition.Open);
        expect(tags[0].name).toEqual('loop');
        expect(tags[0].rawText).toEqual('{#loop}');

        // close tag
        expect(tags[1].disposition).toEqual(TagDisposition.Close);
        expect(tags[1].name).toEqual('loop');
        expect(tags[1].rawText).toEqual('{/loop}');
    });

    test('splitted simple tag', () => {

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

        const parser = createTagParser();
        const tags = parser.parse(delimiters);

        expect(tags.length).toEqual(1);

        // tag
        expect(tags[0].disposition).toEqual(TagDisposition.Open);
        expect(tags[0].name).toEqual('loop');
        expect(tags[0].rawText).toEqual('{#loop}');
    });

    test('splitted closing tag', () => {

        const paragraphNode = parseXml(`
            <w:p>
                <w:r>
                    <w:t>{#loop}{text}{/</w:t>
                </w:r>
                <w:r>
                    <w:t>loop</w:t>
                </w:r>
                <w:r>
                    <w:t>}</w:t>
                </w:r>
            </w:p>
        `);

        const firstTextNode = paragraphNode.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
        expect(firstTextNode.textContent).toEqual('{#loop}{text}{/');

        const thirdTextNode = paragraphNode.childNodes[2].childNodes[0].childNodes[0] as XmlTextNode;
        expect(thirdTextNode.textContent).toEqual('}');

        const delimiters: DelimiterMark[] = [
            {
                isOpen: true,
                index: 0,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: false,
                index: 6,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: true,
                index: 7,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: false,
                index: 12,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: true,
                index: 13,
                xmlTextNode: firstTextNode
            },
            {
                isOpen: false,
                index: 0,
                xmlTextNode: thirdTextNode
            }
        ];

        const parser = createTagParser();
        const tags = parser.parse(delimiters);

        expect(tags).toHaveLength(3);

        expect(tags[0].disposition).toEqual(TagDisposition.Open);
        expect(tags[0].name).toEqual('loop');
        expect(tags[0].rawText).toEqual('{#loop}');

        expect(tags[1].disposition).toEqual(TagDisposition.SelfClosed);
        expect(tags[1].name).toEqual('text');
        expect(tags[1].rawText).toEqual('{text}');

        expect(tags[2].disposition).toEqual(TagDisposition.Close);
        expect(tags[2].name).toEqual('loop');
        expect(tags[2].rawText).toEqual('{/loop}');
    });
});

function createTagParser(): TagParser {

    const xmlParser = new XmlParser();
    const docxParser = new DocxParser(xmlParser);
    const delimiters = new Delimiters();
    return new TagParser(docxParser, delimiters);
}
