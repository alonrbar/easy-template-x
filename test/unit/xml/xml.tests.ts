import { COMMENT_NODE_NAME, TEXT_NODE_NAME, XmlCommentNode, XmlNode, XmlNodeType, xmlParser, XmlTextNode } from "src/xml";
import { parseXml } from "../../testUtils";
import { xml, XmlUtils } from "src/xml/xml";

describe(XmlUtils, () => {

    describe(xml.serialize.serialize, () => {

        it('serializes a simple text node', () => {
            const node = xml.create.createTextNode('hello');
            const str = xml.serialize.serialize(node);
            expect(str).toEqual('hello');
        });

        it('serializes a text node with null value as an empty string', () => {
            const node = xml.create.createTextNode(null);
            const str = xml.serialize.serialize(node);
            expect(str).toEqual('');
        });

        it('serializes a text node with undefined value as an empty string', () => {
            const node = xml.create.createTextNode(undefined);
            const str = xml.serialize.serialize(node);
            expect(str).toEqual('');
        });

        it('serializes an attribute with quotes', () => {
            const node = xml.create.createGeneralNode('node');
            node.attributes = {
                att: 'Some "quoted" value.'
            };
            const str = xml.serialize.serialize(node);
            expect(str).toEqual('<node att="Some &quot;quoted&quot; value."/>');
        });

        it('serializes a comment node', () => {
            const node = xml.create.createCommentNode('comment');
            const str = xml.serialize.serialize(node);
            expect(str).toEqual('<!-- comment -->');
        });
    });

    describe(xml.create.fromDomNode, () => {

        it('creates a valid xml node from a single dom node', () => {

            const domNode = createDomNode('<my-node/>');
            const xmlNode = xml.create.fromDomNode(domNode);

            expect(xmlNode.nodeName).toEqual('my-node');
            expect(xmlNode.nodeType).toEqual(XmlNodeType.General);
            expect(xmlNode.parentNode).toBeFalsy();
            expect(xmlNode.childNodes.length).toEqual(0);
            expect(xmlNode.nextSibling).toBeFalsy();
        });

        it('creates a valid xml tree from a dom node with a single child', () => {
            const domNode = createDomNode(`
                <root>
                    <child></child>
                </root>
            `, true);
            const xmlNode = xml.create.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).toEqual('root');
            expect(xmlNode.nodeType).toEqual(XmlNodeType.General);
            expect(root.parentNode).toBeFalsy();
            expect(root.childNodes.length).toEqual(1);
            expect(root.nextSibling).toBeFalsy();

            // child
            const child = root.childNodes[0];
            expect(child.nodeName).toEqual('child');
            expect(xmlNode.nodeType).toEqual(XmlNodeType.General);
            expect(child.parentNode).toEqual(root);
            expect(child.childNodes.length).toEqual(0);
            expect(child.nextSibling).toBeFalsy();
        });

        it('creates a valid xml tree from a mixed tree', () => {
            const domNode = createDomNode(`
                <root>
                    <!-- comment -->
                    <child></child>
                    <child></child>
                    <other-child>hi</other-child>
                </root>
            `, true);
            const xmlNode = xml.create.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).toEqual('root');
            expect(root.nodeType).toEqual(XmlNodeType.General);
            expect(root.parentNode).toBeFalsy();
            expect(root.childNodes.length).toEqual(4);
            expect(root.nextSibling).toBeFalsy();

            const comment = root.childNodes[0];
            const child1 = root.childNodes[1];
            const child2 = root.childNodes[2];
            const child3 = root.childNodes[3];
            const grandchild1 = root.childNodes[3].childNodes[0];

            // comment
            expect(comment.nodeName).toEqual(COMMENT_NODE_NAME);
            expect(comment.nodeType).toEqual(XmlNodeType.Comment);
            expect(comment.parentNode).toEqual(root);
            expect(comment.childNodes).toBeFalsy();
            expect((comment as XmlCommentNode).commentContent).toEqual('comment');
            expect(comment.nextSibling).toEqual(child1);

            // child #1
            expect(child1.nodeName).toEqual('child');
            expect(child1.nodeType).toEqual(XmlNodeType.General);
            expect(child1.parentNode).toEqual(root);
            expect(child1.childNodes.length).toEqual(0);
            expect(child1.nextSibling).toEqual(child2);

            // child #2
            expect(child2.nodeName).toEqual('child');
            expect(child2.nodeType).toEqual(XmlNodeType.General);
            expect(child2.parentNode).toEqual(root);
            expect(child2.childNodes.length).toEqual(0);
            expect(child2.nextSibling).toEqual(child3);

            // child #3
            expect(child3.nodeName).toEqual('other-child');
            expect(child3.nodeType).toEqual(XmlNodeType.General);
            expect(child3.parentNode).toEqual(root);
            expect(child3.childNodes.length).toEqual(1);
            expect(child3.nextSibling).toBeFalsy();

            // grandchild #3
            expect(grandchild1.nodeName).toEqual(TEXT_NODE_NAME);
            expect(grandchild1.nodeType).toEqual(XmlNodeType.Text);
            expect(grandchild1.parentNode).toEqual(child3);
            expect((grandchild1 as XmlTextNode).textContent).toEqual('hi');
            expect(grandchild1.childNodes).toBeFalsy();
            expect(grandchild1.nextSibling).toBeFalsy();
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

function createDomNode(xml: string, removeWhiteSpace = false): Node {
    if (removeWhiteSpace) // remove all whitespace outside of tags
        xml = xml.replace(/>\s+</g, '><').trim();
    const document = xmlParser.domParse(xml);
    return document.documentElement;
}
