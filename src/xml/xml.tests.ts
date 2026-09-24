import { XmlNode, XmlNodeType } from "src/xml";
import { xml, XmlUtils } from "src/xml/xml";
import { parseXml } from "test/testUtils";
import { describe, expect, it } from "vitest";

describe(XmlUtils, () => {

    describe(xml.parser.serializeNode, () => {

        it('serializes a simple text node', () => {
            const node = xml.create.textNode('hello');
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('hello');
        });

        it('serializes a text node with null value as an empty string', () => {
            const node = xml.create.textNode(null);
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('');
        });

        it('serializes a text node with undefined value as an empty string', () => {
            const node = xml.create.textNode(undefined);
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('');
        });

        it('serializes an attribute with quotes', () => {
            const node = xml.create.generalNode('node');
            node.attributes = {
                att: 'Some "quoted" value.'
            };
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('<node att="Some &quot;quoted&quot; value."/>');
        });

        it('serializes whitespace in an attribute as character references', () => {
            const node = xml.create.generalNode('node');
            node.attributes = {
                att: 'a\nb\rc\td e'
            };
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('<node att="a&#10;b&#13;c&#9;d e"/>');
        });

        it('serializes a carriage return in text as a character reference', () => {
            const node = xml.create.textNode('a\r\nb\tc');
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('a&#13;\nb\tc');
        });

        it('serializes a comment node', () => {
            const node = xml.create.commentNode('comment');
            const str = xml.parser.serializeNode(node);
            expect(str).toEqual('<!-- comment -->');
        });

        it('serializes a node with indentation', () => {
            const node = parseXml('<node><child>hello</child></node>', true);
            const str = xml.parser.serializeNode(node, { indent: 2 });
            expect(str).toEqual('<node>\n  <child>hello</child>\n</node>');
        });
    });

    describe(xml.modify.insertBefore, () => {

        it('inserts before an only child', () => {

            const parent = parseXml(`
                <root>
                    <child></child>
                </root>
            `, true);

            const child = parent.childNodes[0];
            const newChild: XmlNode = {
                nodeName: 'new-child',
                nodeType: XmlNodeType.General
            };

            xml.modify.insertBefore(newChild, child);

            // parent
            expect(parent.parentNode).toBeFalsy();
            expect(parent.nextSibling).toBeFalsy();
            expect(parent.childNodes.length).toEqual(2);
            expect(parent.childNodes[0]).toEqual(newChild);
            expect(parent.childNodes[1]).toEqual(child);

            // child
            expect(child.parentNode).toEqual(parent);
            expect(child.childNodes.length).toEqual(0);
            expect(child.nextSibling).toBeFalsy();

            // new child
            expect(newChild.parentNode).toEqual(parent);
            expect((newChild.childNodes || []).length).toEqual(0);
            expect(newChild.nextSibling).toEqual(child);
        });

    });

    describe(xml.modify.insertChild, () => {

        it('inserts into an empty child collection', () => {

            const parent = parseXml(`<root></root>`, true);

            const child: XmlNode = {
                nodeName: 'new-child',
                nodeType: XmlNodeType.General
            };

            xml.modify.insertChild(parent, child, 0);

            // parent
            expect(parent.parentNode).toBeFalsy();
            expect(parent.nextSibling).toBeFalsy();
            expect(parent.childNodes.length).toEqual(1);
            expect(parent.childNodes[0]).toEqual(child);

            // child
            expect(child.parentNode).toEqual(parent);
            expect((child.childNodes || []).length).toEqual(0);
            expect(child.nextSibling).toBeFalsy();

        });

    });

    describe(xml.modify.appendChild, () => {

        it('appends a child', () => {

            const parent = parseXml(`
                <root>
                    <child></child>
                </root>
            `, true);

            const child = parent.childNodes[0];
            const newChild: XmlNode = {
                nodeName: 'new-child',
                nodeType: XmlNodeType.General
            };

            xml.modify.appendChild(parent, newChild);

            // parent
            expect(parent.parentNode).toBeFalsy();
            expect(parent.nextSibling).toBeFalsy();
            expect(parent.childNodes.length).toEqual(2);
            expect(parent.childNodes[0]).toEqual(child);
            expect(parent.childNodes[1]).toEqual(newChild);

            // child
            expect(child.parentNode).toEqual(parent);
            expect(child.childNodes.length).toEqual(0);
            expect(child.nextSibling).toEqual(newChild);

            // new child
            expect(newChild.parentNode).toEqual(parent);
            expect((newChild.childNodes || []).length).toEqual(0);
            expect(newChild.nextSibling).toBeFalsy();

        });

    });

});
