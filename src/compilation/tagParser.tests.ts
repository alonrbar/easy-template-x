import { AttributeDelimiterMark, TextNodeDelimiterMark } from "src/compilation/delimiters/delimiterMark";
import { AttributeTag, TagDisposition, TagPlacement } from "src/compilation/tag";
import { TagParser } from "src/compilation/tagParser";
import { Delimiters } from "src/delimiters";
import { MissingCloseDelimiterError, MissingStartDelimiterError, TagOptionsParseError } from "src/errors";
import { xml, XmlNodeType, XmlTextNode } from "src/xml";
import { parseXml } from "test/testUtils";
import { describe, expect, test } from "vitest";

describe(TagParser, () => {

    describe('text node delimiters', () => {

        test('trim tag names', () => {

            const paragraph = parseXml(`
                <w:p><w:r><w:t>{# my loop  }{ my tag  }{/  my loop }</w:t></w:r></w:p>
            `, false);

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            expect(textNode.textContent).toEqual('{# my loop  }{ my tag  }{/  my loop }');

            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 12,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 13,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 23,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 24,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
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

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            const delimiters: TextNodeDelimiterMark[] = [
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

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 5,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 11,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 17,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
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

            const firstTextNode = xml.query.findByPath(runNode, XmlNodeType.Text, 0, 0);
            const secondTextNode = xml.query.findByPath(runNode, XmlNodeType.Text, 1, 0);
            const thirdTextNode = xml.query.findByPath(runNode, XmlNodeType.Text, 2, 0);
            const delimiters: TextNodeDelimiterMark[] = [
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
                    xmlTextNode: secondTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 1,
                    xmlTextNode: secondTextNode
                },
                {
                    placement: TagPlacement.TextNode,
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
            const runNode = xml.query.findByPath(paragraphNode, XmlNodeType.General, 0);

            const firstTextNode = xml.query.findByPath(runNode, XmlNodeType.Text, 0, 0);
            const secondTextNode = xml.query.findByPath(runNode, XmlNodeType.Text, 1, 0);
            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
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

            const firstTextNode = xml.query.findByPath(paragraphNode, XmlNodeType.Text, 0, 0, 0);
            expect(firstTextNode.textContent).toEqual('{#loop}{text}{/');

            const thirdTextNode = xml.query.findByPath(paragraphNode, XmlNodeType.Text, 2, 0, 0);
            expect(thirdTextNode.textContent).toEqual('}');

            const delimiters: TextNodeDelimiterMark[] = [
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
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 7,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 12,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 13,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
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

        test('close delimiter in different paragraph throws MissingCloseDelimiterError', () => {

            const body = parseXml(`
                <w:body>
                    <w:p><w:r><w:t>{my_simple_</w:t></w:r></w:p>
                    <w:p><w:r><w:t>tag}</w:t></w:r></w:p>
                </w:body>
            `, false);

            const firstParagraph = body.childNodes.find(node => node.nodeName === 'w:p');
            const secondParagraph = body.childNodes.findLast(node => node.nodeName === 'w:p');

            const firstRun = firstParagraph.childNodes[0];
            const secondRun = secondParagraph.childNodes[0];

            const firstTextNode = firstRun.childNodes[0] as XmlTextNode;
            const secondTextNode = secondRun.childNodes[0] as XmlTextNode;

            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: firstTextNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 4,
                    xmlTextNode: secondTextNode
                }
            ];

            const parser = createTagParser();
            expect(() => parser.parse(delimiters)).toThrow(MissingCloseDelimiterError);
        });
    });

    describe('attribute delimiters', () => {

        test('simple attribute tag', () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:drawing>
                            <wp:inline>
                                <wp:docPr descr="{my_tag}" />
                            </wp:inline>
                        </w:drawing>
                    </w:r>
                </w:p>
            `, false);

            const docPrNode = xml.query.findByPath(paragraph, XmlNodeType.General, 0, 0, 0, 0);
            expect(docPrNode.attributes.descr).toEqual('{my_tag}');

            const delimiters: AttributeDelimiterMark[] = [
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 0,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 7,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                }
            ];

            const parser = createTagParser();
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(1);

            const tag = tags[0] as AttributeTag;
            expect(tag.disposition).toEqual(TagDisposition.SelfClosed);
            expect(tag.name).toEqual('my_tag');
            expect(tag.rawText).toEqual('{my_tag}');
            expect(tag.placement).toEqual(TagPlacement.Attribute);
            expect(tag.xmlNode).toEqual(docPrNode);
            expect(tag.attributeName).toEqual('descr');
        });

        test('open and close tags in attribute', () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:drawing>
                        <wp:docPr descr="{#loop}content{/loop}"/>
                    </w:drawing>
                </w:p>
            `, false);

            const docPrNode = xml.query.findByPath(paragraph, XmlNodeType.General, 0, 0);
            expect(docPrNode.attributes.descr).toEqual('{#loop}content{/loop}');

            const delimiters: AttributeDelimiterMark[] = [
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 0,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 6,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 14,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 20,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                }
            ];

            const parser = createTagParser();
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(2);

            // open tag
            const openTag = tags[0] as AttributeTag;
            expect(openTag.disposition).toEqual(TagDisposition.Open);
            expect(openTag.name).toEqual('loop');
            expect(openTag.rawText).toEqual('{#loop}');
            expect(openTag.placement).toEqual(TagPlacement.Attribute);

            // close tag
            const closeTag = tags[1] as AttributeTag;
            expect(closeTag.disposition).toEqual(TagDisposition.Close);
            expect(closeTag.name).toEqual('loop');
            expect(closeTag.rawText).toEqual('{/loop}');
            expect(closeTag.placement).toEqual(TagPlacement.Attribute);
        });

        test('multiple self-closed tags in attribute', () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:drawing>
                        <wp:docPr descr="{tag1}{tag2}{tag3}"/>
                    </w:drawing>
                </w:p>
            `, false);

            const docPrNode = xml.query.findByPath(paragraph, XmlNodeType.General, 0, 0);
            expect(docPrNode.attributes.descr).toEqual('{tag1}{tag2}{tag3}');

            const delimiters: AttributeDelimiterMark[] = [
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 0,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 5,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 6,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 11,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 12,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 17,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                }
            ];

            const parser = createTagParser();
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(3);

            expect(tags[0].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[0].name).toEqual('tag1');
            expect(tags[0].rawText).toEqual('{tag1}');

            expect(tags[1].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[1].name).toEqual('tag2');
            expect(tags[1].rawText).toEqual('{tag2}');

            expect(tags[2].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[2].name).toEqual('tag3');
            expect(tags[2].rawText).toEqual('{tag3}');
        });

        test('tag with options in attribute', () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:drawing>
                        <wp:docPr descr="{my_tag [opt: 'value', count: 5]}"/>
                    </w:drawing>
                </w:p>
            `, false);

            const docPrNode = xml.query.findByPath(paragraph, XmlNodeType.General, 0, 0);
            expect(docPrNode.attributes.descr).toEqual("{my_tag [opt: 'value', count: 5]}");

            const delimiters: AttributeDelimiterMark[] = [
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 0,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 32,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                }
            ];

            const parser = createTagParser();
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(1);
            expect(tags[0].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[0].name).toEqual('my_tag');
            expect(tags[0].options).toEqual({ opt: 'value', count: 5 });
            expect(tags[0].rawText).toEqual("{my_tag [opt: 'value', count: 5]}");
        });

        test('missing open delimiter in attribute throws MissingStartDelimiterError', () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:drawing>
                        <wp:docPr descr="my_tag}"/>
                    </w:drawing>
                </w:p>
            `, false);

            const docPrNode = xml.query.findByPath(paragraph, XmlNodeType.General, 0, 0);
            expect(docPrNode.attributes.descr).toEqual('my_tag}');

            const delimiters: AttributeDelimiterMark[] = [
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 6,
                    xmlNode: docPrNode,
                    attributeName: 'descr'
                }
            ];

            const parser = createTagParser();
            expect(() => parser.parse(delimiters)).toThrow(MissingStartDelimiterError);
        });

        test('open and close tags in different attributes throws MissingCloseDelimiterError', () => {
            const paragraph = parseXml(`
                <w:p>
                    <w:r>
                        <w:drawing>
                            <wp:inline>
                                <wp:docPr descr="{my_tag" />
                            </wp:inline>
                        </w:drawing>
                    </w:r>
                    <w:r>
                        <w:drawing>
                            <wp:inline>
                                <wp:docPr descr="}" />
                            </wp:inline>
                        </w:drawing>
                    </w:r>
                </w:p>
            `, false);

            const docPrNode1 = xml.query.findByPath(paragraph, XmlNodeType.General, 0, 0, 0, 0);
            expect(docPrNode1.attributes.descr).toEqual('{my_tag');

            const docPrNode2 = xml.query.findByPath(paragraph, XmlNodeType.General, 1, 0, 0, 0);
            expect(docPrNode2.attributes.descr).toEqual('}');

            const delimiters: AttributeDelimiterMark[] = [
                {
                    placement: TagPlacement.Attribute,
                    isOpen: true,
                    index: 0,
                    xmlNode: docPrNode1,
                    attributeName: 'descr'
                },
                {
                    placement: TagPlacement.Attribute,
                    isOpen: false,
                    index: 0,
                    xmlNode: docPrNode2,
                    attributeName: 'descr'
                }
            ];

            const parser = createTagParser();
            expect(() => parser.parse(delimiters)).toThrow(MissingCloseDelimiterError);
        });
    });

    describe('tag options', () => {

        test('simple', () => {

            const text = '{#loop [opt: "yes"]}{/loop}';
            const paragraph = parseXml(`
                <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
            `, false);

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 19,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 20,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 26,
                    xmlTextNode: textNode
                }
            ];

            const parser = createTagParser();
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(2);

            // open tag
            expect(tags[0].disposition).toEqual(TagDisposition.Open);
            expect(tags[0].name).toEqual('loop');
            expect(tags[0].options).toEqual({ opt: 'yes' });
            expect(tags[0].rawText).toEqual('{#loop [opt: "yes"]}');

            // close tag
            expect(tags[1].disposition).toEqual(TagDisposition.Close);
            expect(tags[1].name).toEqual('loop');
            expect(tags[1].options).toBeFalsy();
            expect(tags[1].rawText).toEqual('{/loop}');
        });

        test('simple - with whitespace', () => {

            const text = '{ # loop [opt: "yes"] }{ / loop }';
            const paragraph = parseXml(`
                <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
            `, false);

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 22,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 23,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 32,
                    xmlTextNode: textNode
                }
            ];

            const parser = createTagParser();
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(2);

            // open tag
            expect(tags[0].disposition).toEqual(TagDisposition.Open);
            expect(tags[0].name).toEqual('loop');
            expect(tags[0].options).toEqual({ opt: 'yes' });
            expect(tags[0].rawText).toEqual('{ # loop [opt: "yes"] }');

            // close tag
            expect(tags[1].disposition).toEqual(TagDisposition.Close);
            expect(tags[1].name).toEqual('loop');
            expect(tags[1].options).toBeFalsy();
            expect(tags[1].rawText).toEqual('{ / loop }');
        });

        test('angular parser style with brackets', () => {

            const text = '{something[0] [[myOpt: 5]]}';
            const paragraph = parseXml(`
                <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
            `, false);

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 26,
                    xmlTextNode: textNode
                }
            ];

            const parser = createTagParser({
                tagOptionsStart: '[[',
                tagOptionsEnd: ']]'
            });
            const tags = parser.parse(delimiters);

            expect(tags.length).toEqual(1);

            expect(tags[0].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[0].name).toEqual('something[0]');
            expect(tags[0].options).toEqual({ myOpt: 5 });
            expect(tags[0].rawText).toEqual('{something[0] [[myOpt: 5]]}');
        });

        test('invalid options', () => {

            const text = '{something [myOpt 5]}';
            const paragraph = parseXml(`
                <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
            `, false);

            const textNode = xml.query.findByPath(paragraph, XmlNodeType.Text, 0, 0, 0);
            const delimiters: TextNodeDelimiterMark[] = [
                {
                    placement: TagPlacement.TextNode,
                    isOpen: true,
                    index: 0,
                    xmlTextNode: textNode
                },
                {
                    placement: TagPlacement.TextNode,
                    isOpen: false,
                    index: 20,
                    xmlTextNode: textNode
                }
            ];

            const parser = createTagParser();
            let err: Error;
            try {
                parser.parse(delimiters);
            } catch (e) {
                err = e;
            }

            expect(err).toBeTruthy();
            expect(err).toBeInstanceOf(TagOptionsParseError);

            const parseErr = err as TagOptionsParseError;
            expect(parseErr.tagRawText).toEqual(text);
            expect(parseErr.parseError).toBeTruthy();
        });

    });
});

function createTagParser(delim?: Partial<Delimiters>): TagParser {

    const delimiters = new Delimiters(delim);
    return new TagParser(delimiters);
}
