import { DelimiterMark, DelimiterSearcher, TagPlacement } from "src/compilation";
import { Delimiters } from "src/delimiters";
import { XmlNodeType } from "src/xml";
import { describe, expect, test } from "vitest";
import { getChildNode, parseXml } from "../../testUtils";

describe(DelimiterSearcher, () => {

    describe('single character delimiters', () => {

        test('simple paragraph', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{#loop}{/loop}</w:t>
                    </w:r>
                </w:p>
            `);

            const textNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{',
                tagEnd: '}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('two different text nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{#lo</w:t>
                        <w:t>op}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const secondTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 1, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{',
                tagEnd: '}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('two different run nodes', () => {

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

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const thirdTextNode = getChildNode(paragraph, XmlNodeType.Text, 2, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{',
                tagEnd: '}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test("inline drawing in the middle of a tag", () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t xml:space="preserve">{Text </w:t>
                    </w:r>
                    <w:r>
                        <w:drawing>
                            <wp:inline>
                                <wp:docPr descr="{Attribute Tag}"/>
                            </wp:inline>
                        </w:drawing>
                    </w:r>
                    <w:r>
                        <w:t>Tag}</w:t>
                    </w:r>
                </w:p>
            `, false);

            const openTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const closeTextNode = getChildNode(paragraph, XmlNodeType.Text, 2, 0, 0);
            const imagePropertiesNode = getChildNode(paragraph, XmlNodeType.General, 1, 0, 0, 0);
            const expected: DelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: openTextNode
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 0,
                    xmlNode: imagePropertiesNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 14,
                    xmlNode: imagePropertiesNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 3,
                    xmlTextNode: closeTextNode
                },
            ];

            const searcher = createDelimiterSearcher({
                tagStart: '{',
                tagEnd: '}'
            });

            const delimiters = searcher.findDelimiters(paragraph);
            expect(delimiters).toEqual(expected);
        });
    });

    describe('multi character delimiters', () => {

        test('simple paragraph', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{#loop}}{{/loop}}</w:t>
                    </w:r>
                </w:p>
            `);

            const textNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{{',
                tagEnd: '}}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('two different text nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{#lo</w:t>
                        <w:t>op}}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const secondTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 1, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{{',
                tagEnd: '}}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('two different run nodes', () => {

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

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const thirdTextNode = getChildNode(paragraph, XmlNodeType.Text, 2, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{{',
                tagEnd: '}}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('delimiters splitted across several different run nodes', () => {

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

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{{{',
                tagEnd: '}}}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });
    });

    describe('text contains multiple delimiter prefixes', () => {

        test('simple paragraph', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{{!#loop!}}{{!/loop!}}</w:t>
                    </w:r>
                </w:p>
            `);

            const textNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{!',
                tagEnd: '!}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('two different text nodes', () => {

            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{!#lo</w:t>
                        <w:t>op!}</w:t>
                    </w:r>
                </w:p>
            `);

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const secondTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 1, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{!',
                tagEnd: '!}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });

        test('two different run nodes', () => {

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

            const firstTextNode = getChildNode(paragraph, XmlNodeType.Text, 0, 0, 0);
            const thirdTextNode = getChildNode(paragraph, XmlNodeType.Text, 2, 0, 0);
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

            const searcher = createDelimiterSearcher({
                tagStart: '{!',
                tagEnd: '!}'
            });
            const delimiters = searcher.findDelimiters(paragraph);

            expect(delimiters).toEqual(expected);
        });
    });
});

function createDelimiterSearcher(delimitersSetup?: Partial<Delimiters>): DelimiterSearcher {
    const delimiters = new Delimiters(delimitersSetup);
    return new DelimiterSearcher(delimiters, 20);
}
