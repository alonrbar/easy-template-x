import { DelimiterMark, TextNodesDelimiterSearcher, TagPlacement } from "src/compilation";
import { XmlTextNode } from "src/xml";
import { describe, expect, it } from "vitest";
import { parseXml } from "../../testUtils";

describe(TextNodesDelimiterSearcher, () => {

    describe('single character delimiters', () => {

        it('finds all delimiters in a simple paragraph', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{#loop}{/loop}</w:t>
                    </w:r>
                </w:p>
            `);

            const textNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 6,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 7,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 13,
                    xmlTextNode: textNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{';
            searcher.endDelimiter = '}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('finds all delimiters in two different text nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{#lo</w:t>
                        <w:t>op}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const secondTextNode = paragraph.childNodes[0].childNodes[1].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 2,
                    xmlTextNode: secondTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{';
            searcher.endDelimiter = '}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('finds all delimiters in two different run nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{</w:t>
                    </w:r>
                    <w:r>
                        <w:t>tag</w:t>
                    </w:r>
                    <w:r>
                        <w:t>}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const thirdTextNode = paragraph.childNodes[2].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 0,
                    xmlTextNode: thirdTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{';
            searcher.endDelimiter = '}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });
    });

    describe('multi character delimiters', () => {

        it('finds all delimiters in a simple paragraph', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{#loop}}{{/loop}}</w:t>
                    </w:r>
                </w:p>
            `);

            const textNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 7,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 9,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 16,
                    xmlTextNode: textNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{{';
            searcher.endDelimiter = '}}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('finds all delimiters in two different text nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{#lo</w:t>
                        <w:t>op}}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const secondTextNode = paragraph.childNodes[0].childNodes[1].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 2,
                    xmlTextNode: secondTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{{';
            searcher.endDelimiter = '}}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('finds all delimiters in two different run nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{</w:t>
                    </w:r>
                    <w:r>
                        <w:t>tag</w:t>
                    </w:r>
                    <w:r>
                        <w:t>}}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const thirdTextNode = paragraph.childNodes[2].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 0,
                    xmlTextNode: thirdTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{{';
            searcher.endDelimiter = '}}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('handles delimiters splitted to several different run nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{</w:t>
                    </w:r>
                    <w:r>
                        <w:t>{{tag}</w:t>
                    </w:r>
                    <w:r>
                        <w:t>}</w:t>
                    </w:r>
                    <w:r>
                        <w:t>}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 6,
                    xmlTextNode: firstTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{{{';
            searcher.endDelimiter = '}}}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });
    });

    describe('text contains multiple delimiter prefixes', () => {

        it('finds all delimiters in a simple paragraph', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{!#loop!}}{{!/loop!}}</w:t>
                    </w:r>
                </w:p>
            `);

            const textNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 1,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 8,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 12,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 19,
                    xmlTextNode: textNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{!';
            searcher.endDelimiter = '!}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('finds all delimiters in two different text nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{!#lo</w:t>
                        <w:t>op!}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const secondTextNode = paragraph.childNodes[0].childNodes[1].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 2,
                    xmlTextNode: secondTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{!';
            searcher.endDelimiter = '!}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        it('finds all delimiters in two different run nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{!</w:t>
                    </w:r>
                    <w:r>
                        <w:t>tag</w:t>
                    </w:r>
                    <w:r>
                        <w:t>!}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = paragraph.childNodes[0].childNodes[0].childNodes[0] as XmlTextNode;
            const thirdTextNode = paragraph.childNodes[2].childNodes[0].childNodes[0] as XmlTextNode;
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 0,
                    xmlTextNode: thirdTextNode
                }
            ];

            const searcher = createDelimiterSearcher();
            searcher.startDelimiter = '{!';
            searcher.endDelimiter = '!}';
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });
    });
});

function createDelimiterSearcher(): TextNodesDelimiterSearcher {
    return new TextNodesDelimiterSearcher();
}
