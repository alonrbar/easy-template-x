import { XmlParseError } from "src/errors";
import { COMMENT_NODE_NAME, TEXT_NODE_NAME, XmlCommentNode, XmlGeneralNode, XmlNodeType, XmlTextNode } from "src/xml";
import { xml } from "src/xml/xml";
import { XmlParser } from "src/xml/xmlParser";
import { describe, expect, test } from "vitest";

describe(XmlParser, () => {

    describe('tree structure', () => {

        test('single self-closing element', () => {
            const node = XmlParser.parse('<my-node/>');

            expect(node.nodeName).toEqual('my-node');
            expect(node.nodeType).toEqual(XmlNodeType.General);
            expect(node.parentNode).toBeFalsy();
            expect(node.childNodes.length).toEqual(0);
            expect(node.nextSibling).toBeFalsy();
            expect(node.attributes).toEqual({});
        });

        test('element with a single child', () => {
            const root = XmlParser.parse('<root><child></child></root>');

            expect(root.nodeName).toEqual('root');
            expect(root.parentNode).toBeFalsy();
            expect(root.childNodes.length).toEqual(1);

            const child = root.childNodes[0];
            expect(child.nodeName).toEqual('child');
            expect(child.nodeType).toEqual(XmlNodeType.General);
            expect(child.parentNode).toBe(root);
            expect(child.childNodes.length).toEqual(0);
            expect(child.nextSibling).toBeFalsy();
        });

        test('mixed tree - comment, elements and text with parent and sibling references', () => {
            const root = XmlParser.parse(`<root><!-- comment --><child></child><child/><other-child>hi</other-child></root>`);

            expect(root.nodeName).toEqual('root');
            expect(root.childNodes.length).toEqual(4);

            const comment = root.childNodes[0];
            const child1 = root.childNodes[1];
            const child2 = root.childNodes[2];
            const child3 = root.childNodes[3];
            const grandchild = child3.childNodes[0];

            // comment
            expect(comment.nodeName).toEqual(COMMENT_NODE_NAME);
            expect(comment.nodeType).toEqual(XmlNodeType.Comment);
            expect(comment.parentNode).toBe(root);
            expect(comment.childNodes).toBeFalsy();
            expect((comment as XmlCommentNode).commentContent).toEqual('comment');
            expect(comment.nextSibling).toBe(child1);

            // children
            expect(child1.nodeName).toEqual('child');
            expect(child1.parentNode).toBe(root);
            expect(child1.nextSibling).toBe(child2);

            expect(child2.nodeName).toEqual('child');
            expect(child2.parentNode).toBe(root);
            expect(child2.nextSibling).toBe(child3);

            expect(child3.nodeName).toEqual('other-child');
            expect(child3.parentNode).toBe(root);
            expect(child3.childNodes.length).toEqual(1);
            expect(child3.nextSibling).toBeFalsy();

            // text
            expect(grandchild.nodeName).toEqual(TEXT_NODE_NAME);
            expect(grandchild.nodeType).toEqual(XmlNodeType.Text);
            expect(grandchild.parentNode).toBe(child3);
            expect((grandchild as XmlTextNode).textContent).toEqual('hi');
            expect(grandchild.childNodes).toBeFalsy();
            expect(grandchild.nextSibling).toBeFalsy();
        });

        test('whitespace text nodes are preserved', () => {
            const root = XmlParser.parse('<root>\n  <child/>\n</root>');

            expect(root.childNodes.length).toEqual(3);
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('\n  ');
            expect(root.childNodes[1].nodeName).toEqual('child');
            expect((root.childNodes[2] as XmlTextNode).textContent).toEqual('\n');
        });

        test('prefixed names without namespace declarations', () => {
            const root = XmlParser.parse('<root><w:p><w:r w:val="1"><w:t>text</w:t></w:r></w:p></root>');

            const p = root.childNodes[0] as XmlGeneralNode;
            const r = p.childNodes[0] as XmlGeneralNode;
            const t = r.childNodes[0] as XmlGeneralNode;
            expect(p.nodeName).toEqual('w:p');
            expect(r.nodeName).toEqual('w:r');
            expect(r.attributes).toEqual({ 'w:val': '1' });
            expect(t.nodeName).toEqual('w:t');
        });

        test('round-trip through the serializer', () => {
            const input = '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t xml:space="preserve">a &amp; b &lt; c</w:t></w:r></w:p></w:body></w:document>';
            const root = XmlParser.parse(input);
            expect(xml.parser.serializeNode(root)).toEqual(input);
        });

        test('round-trip preserves whitespace character references', () => {
            const input = '<r a="x&#10;y&#13;z&#9;w">p&#13;q\nr</r>';
            const root = XmlParser.parse(input);
            expect(xml.parser.serializeNode(root)).toEqual(input);
        });
    });

    describe('attributes', () => {

        test('double and single quoted attributes', () => {
            const node = XmlParser.parse(`<node a="1" b='two' c = "3"/>`);
            expect(node.attributes).toEqual({ a: '1', b: 'two', c: '3' });
        });

        test('entities in attribute values', () => {
            const node = XmlParser.parse(`<node a="&quot;x&quot; &amp; &apos;y&apos; &lt;z&gt; &#65;&#x42;"/>`);
            expect(node.attributes.a).toEqual(`"x" & 'y' <z> AB`);
        });

        test('other quote type inside an attribute value', () => {
            const node = XmlParser.parse(`<node a="it's" b='say "hi"'/>`);
            expect(node.attributes).toEqual({ a: "it's", b: 'say "hi"' });
        });

        test('attributes spanning multiple lines', () => {
            const node = XmlParser.parse(`<node\n    a="1"\n    b="2"\n/>`);
            expect(node.attributes).toEqual({ a: '1', b: '2' });
        });

        test('duplicate attribute - last value wins', () => {
            const node = XmlParser.parse(`<node a="1" a="2"/>`);
            expect(node.attributes).toEqual({ a: '2' });
        });

        test('__proto__ attribute name throws XmlParseError', () => {
            expect(() => XmlParser.parse(`<node __proto__="x"/>`)).toThrow(XmlParseError);
        });

        test('attribute names do not pollute the attributes prototype', () => {
            const node = XmlParser.parse(`<node constructor="x" hasOwnProperty="y" toString="z"/>`);

            expect(Object.keys(node.attributes)).toEqual(['constructor', 'hasOwnProperty', 'toString']);
            expect(Object.getPrototypeOf(node.attributes)).toBe(Object.prototype);
            expect(({} as any).constructor).toBe(Object);
            expect(typeof ({} as any).hasOwnProperty).toBe('function');
        });
    });

    describe('text and entities', () => {

        test('predefined entities in text', () => {
            const root = XmlParser.parse('<r>&lt;a&gt; &amp; &quot;b&quot; &apos;c&apos;</r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual(`<a> & "b" 'c'`);
        });

        test('decimal and hex character references', () => {
            const root = XmlParser.parse('<r>&#65;&#x42;&#x1F600;&#8364;</r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('AB😀€');
        });

        test('text without entities', () => {
            const root = XmlParser.parse('<r>plain text</r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('plain text');
        });

        test('entities at the text boundaries', () => {
            const root = XmlParser.parse('<r>&lt;x&gt;</r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('<x>');
        });

        test('encoded entity is not double-decoded', () => {
            const root = XmlParser.parse('<r>&amp;lt;</r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('&lt;');
        });

        test('stray ampersands and unknown entities are kept as-is', () => {
            const root = XmlParser.parse('<r>a & b &nbsp; &#; &#xZZ; &#0; &#1114112; &unterminated</r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('a & b &nbsp; &#; &#xZZ; &#0; &#1114112; &unterminated');
        });

        test('line endings in text, CDATA and comments are normalized - character references are not', () => {
            const root = XmlParser.parse('<r>a\r\nb\rc\td&#13;e<!-- x\r\ny --><![CDATA[p\r\nq]]></r>');
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('a\nb\nc\td\re');
            expect((root.childNodes[1] as XmlCommentNode).commentContent).toEqual('x\ny');
            expect((root.childNodes[2] as XmlTextNode).textContent).toEqual('p\nq');
        });

        test('whitespace in attribute values is normalized - character references are not', () => {
            const node = XmlParser.parse('<r a="x\r\ny\rz\tw\n" b="p&#13;q&#9;r"/>');
            expect(node.attributes.a).toEqual('x y z w ');
            expect(node.attributes.b).toEqual('p\rq\tr');
        });

        test('CDATA section is text without decoding', () => {
            const root = XmlParser.parse('<r>a<![CDATA[<b>&amp;</b>]]>c</r>');
            expect(root.childNodes.length).toEqual(1);
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('a<b>&amp;</b>c');
        });
    });

    describe('skipped content', () => {

        test('xml declaration, processing instructions, doctype and BOM are skipped', () => {
            const root = XmlParser.parse('﻿<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<!DOCTYPE root [ <!ENTITY x "y"> ]>\n<?pi target?>\n<root>&x;</root>\n');
            expect(root.nodeName).toEqual('root');
            expect(root.childNodes.length).toEqual(1);

            // DTD entities are never expanded
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual('&x;');
        });

        test('comments outside of the root element are dropped', () => {
            const root = XmlParser.parse('<!-- before --><root/><!-- after -->');
            expect(root.nodeName).toEqual('root');
            expect(root.childNodes.length).toEqual(0);
        });

        test('processing instructions inside elements are ignored', () => {
            const root = XmlParser.parse('<root><?pi x?><child/></root>');
            expect(root.childNodes.length).toEqual(1);
            expect(root.childNodes[0].nodeName).toEqual('child');
        });
    });

    describe('malformed input', () => {

        const cases: [string, string][] = [
            ['empty input', ''],
            ['whitespace only', '  \n '],
            ['text only', 'hello'],
            ['unterminated open tag', '<root'],
            ['unterminated open tag with attribute', '<root a="1"'],
            ['unterminated attribute value', '<root a="1/>'],
            ['unquoted attribute value', '<root a=1/>'],
            ['attribute without value', '<root a/>'],
            ['unclosed root', '<root><child></child>'],
            ['mismatched closing tag', '<root><child></root></child>'],
            ['closing tag without opening tag', '</root>'],
            ['unterminated closing tag', '<root></root'],
            ['multiple root elements', '<a/><b/>'],
            ['text outside root', '<a/>text'],
            ['unterminated comment', '<root><!-- comment </root>'],
            ['unterminated CDATA', '<root><![CDATA[ x </root>'],
            ['unterminated processing instruction', '<?xml version="1.0" <root/>'],
            ['unterminated doctype', '<!DOCTYPE root [ <root/>'],
            ['unknown markup declaration', '<root><!ELEMENT x></root>'],
            ['empty tag name', '<><root/>'],
            ['stray slash in tag', '<root / >'],
        ];

        for (const [name, input] of cases) {
            test(`${name} throws XmlParseError`, () => {
                expect(() => XmlParser.parse(input)).toThrow(XmlParseError);
            });
        }

        test('mismatched tags - error message', () => {
            expect(() => XmlParser.parse('<a><b></a>')).toThrow('Element closing </a> does not match element opening <b>');
        });

        test('error position, line and column', () => {
            let error: XmlParseError;
            try {
                XmlParser.parse('<a>\n  <b>\r\n    <c/>\n  </a>\n</a>');
            } catch (e) {
                error = e as XmlParseError;
            }

            expect(error).toBeInstanceOf(XmlParseError);
            expect(error.position).toEqual(22);
            expect(error.line).toEqual(4);
            expect(error.column).toEqual(3);
            expect(error.message).toEqual('Failed to parse XML at line 4, column 3: Element closing </a> does not match element opening <b>.');
        });

        test('closing tag errors are reported at the start of the closing tag', () => {
            const inputs = ['<a>\n  </a', '<a>\n  </b>', '<a/>\n  </a>'];
            for (const input of inputs) {
                let error: XmlParseError;
                try {
                    XmlParser.parse(input);
                } catch (e) {
                    error = e as XmlParseError;
                }
                const expectedPosition = input.indexOf('</');
                expect(error).toBeInstanceOf(XmlParseError);
                expect(error.position).toEqual(expectedPosition);
                expect(error.line).toEqual(2);
                expect(error.column).toEqual(expectedPosition - input.indexOf('\n'));
            }
        });

        test('truncated input - error line and column at the end of input', () => {
            let error: XmlParseError;
            try {
                XmlParser.parse('<a>\n<b>');
            } catch (e) {
                error = e as XmlParseError;
            }

            expect(error.line).toEqual(2);
            expect(error.column).toEqual(4);
        });
    });

    describe('robustness', () => {

        test('deep nesting', () => {
            const depth = 100_000;
            const input = '<a>'.repeat(depth) + '</a>'.repeat(depth);

            const root = XmlParser.parse(input);

            let cur = root;
            let measured = 1;
            while (cur.childNodes.length) {
                cur = cur.childNodes[0] as XmlGeneralNode;
                measured++;
            }
            expect(measured).toEqual(depth);
        });

        test('many stray ampersands - linear time', () => {
            const text = '&'.repeat(200_000);
            const start = Date.now();
            const root = XmlParser.parse(`<r>${text}</r>`);
            expect((root.childNodes[0] as XmlTextNode).textContent).toEqual(text);
            expect(Date.now() - start).toBeLessThan(2000);
        });

        test('huge attribute value', () => {
            const value = 'x'.repeat(1_000_000);
            const node = XmlParser.parse(`<r a="${value}"/>`);
            expect(node.attributes.a.length).toEqual(value.length);
        });

        test('many siblings', () => {
            const count = 100_000;
            const root = XmlParser.parse(`<r>${'<c/>'.repeat(count)}</r>`);
            expect(root.childNodes.length).toEqual(count);
            expect(root.childNodes[count - 1].nextSibling).toBeFalsy();
        });
    });
});
