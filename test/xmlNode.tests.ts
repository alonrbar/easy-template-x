import { expect } from 'chai';
import { XmlNode, XmlNodeType } from 'src/xmlNode';
import { XmlParser } from 'src/xmlParser';
import { parseXml } from './testUtils';

// tslint:disable:no-unused-expression

describe(nameof(XmlNode), () => {

    describe(nameof(XmlNode.serialize), () => {

        it('serializes a simple text node', () => {
            const node = XmlNode.createTextNode('hello');
            const str = XmlNode.serialize(node);
            expect(str).to.eql('hello');
        });

        it('serializes a text node with null value as an empty string', () => {
            const node = XmlNode.createTextNode(null);
            const str = XmlNode.serialize(node);
            expect(str).to.eql('');
        });

        it('serializes a text node with undefined value as an empty string', () => {
            const node = XmlNode.createTextNode(undefined);
            const str = XmlNode.serialize(node);
            expect(str).to.eql('');
        });

    });

    describe(nameof(XmlNode.fromDomNode), () => {

        it('creates a valid xml node from a single dom node', () => {

            const domNode = createDomNode('<my-node/>');
            const xmlNode = XmlNode.fromDomNode(domNode);

            expect(xmlNode.nodeName).to.eql('my-node');
            expect(xmlNode.nodeType).to.eql(XmlNodeType.General);
            expect(xmlNode.parentNode).to.not.exist;
            expect(xmlNode.childNodes.length).to.eql(0);
            expect(xmlNode.nextSibling).to.not.exist;
        });

        it('creates a valid xml tree from a dom node with a single child', () => {
            const domNode = createDomNode(`
                <root>
                    <child></child>
                </root>
            `, true);
            const xmlNode = XmlNode.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).to.eql('root');
            expect(xmlNode.nodeType).to.eql(XmlNodeType.General);
            expect(root.parentNode).to.not.exist;
            expect(root.childNodes.length).to.eql(1);
            expect(root.nextSibling).to.not.exist;

            // child
            const child = root.childNodes[0];
            expect(child.nodeName).to.eql('child');
            expect(xmlNode.nodeType).to.eql(XmlNodeType.General);
            expect(child.parentNode).to.eql(root);
            expect(child.childNodes.length).to.eql(0);
            expect(child.nextSibling).to.not.exist;
        });

        it('creates a valid xml tree from a mixed tree', () => {
            const domNode = createDomNode(`
                <root>
                    <child></child>
                    <child></child>
                    <other-child>hi</other-child>
                </root>
            `, true);
            const xmlNode = XmlNode.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).to.eql('root');
            expect(root.nodeType).to.eql(XmlNodeType.General);
            expect(root.parentNode).to.not.exist;
            expect(root.childNodes.length).to.eql(3);
            expect(root.nextSibling).to.not.exist;

            const child1 = root.childNodes[0];
            const child2 = root.childNodes[1];
            const child3 = root.childNodes[2];
            const grandchild1 = root.childNodes[2].childNodes[0];
            
            // child #1
            expect(child1.nodeName).to.eql('child');
            expect(child1.nodeType).to.eql(XmlNodeType.General);
            expect(child1.parentNode).to.eql(root);
            expect(child1.childNodes.length).to.eql(0);
            expect(child1.nextSibling).to.eql(child2);

            // child #2
            expect(child2.nodeName).to.eql('child');
            expect(child2.nodeType).to.eql(XmlNodeType.General);
            expect(child2.parentNode).to.eql(root);
            expect(child2.childNodes.length).to.eql(0);
            expect(child2.nextSibling).to.eql(child3);

            // child #3
            expect(child3.nodeName).to.eql('other-child');
            expect(child3.nodeType).to.eql(XmlNodeType.General);
            expect(child3.parentNode).to.eql(root);
            expect(child3.childNodes.length).to.eql(1);
            expect(child3.nextSibling).to.not.exist;

            // grandchild #3
            expect(grandchild1.nodeName).to.eql(XmlNode.TEXT_NODE_NAME);
            expect(grandchild1.nodeType).to.eql(XmlNodeType.Text);
            expect(grandchild1.parentNode).to.eql(child3);
            expect(grandchild1.childNodes).to.not.exist;
            expect(grandchild1.nextSibling).to.not.exist;
        });

    });

    describe(nameof(XmlNode.insertBefore), () => {

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

            XmlNode.insertBefore(newChild, child);

            // parent
            expect(parent.parentNode).to.not.exist;
            expect(parent.nextSibling).to.not.exist;
            expect(parent.childNodes.length).to.eql(2);
            expect(parent.childNodes[0]).to.eql(newChild);
            expect(parent.childNodes[1]).to.eql(child);

            // child
            expect(child.parentNode).to.eql(parent);
            expect(child.childNodes.length).to.eql(0);
            expect(child.nextSibling).to.not.exist;

            // new child
            expect(newChild.parentNode).to.eql(parent);
            expect((newChild.childNodes || []).length).to.eql(0);
            expect(newChild.nextSibling).to.eql(child);
        });

    });

    describe(nameof(XmlNode.insertChild), () => {

        it('inserts into an empty child collection', () => {

            const parent = parseXml(`<root></root>`, true);

            const child: XmlNode = {
                nodeName: 'new-child',
                nodeType: XmlNodeType.General
            };

            XmlNode.insertChild(parent, child, 0);

            // parent
            expect(parent.parentNode).to.not.exist;
            expect(parent.nextSibling).to.not.exist;
            expect(parent.childNodes.length).to.eql(1);
            expect(parent.childNodes[0]).to.eql(child);

            // child
            expect(child.parentNode).to.eql(parent);
            expect((child.childNodes || []).length).to.eql(0);
            expect(child.nextSibling).to.not.exist;

        });

    });

    describe(nameof(XmlNode.appendChild), () => {

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

            XmlNode.appendChild(parent, newChild);

            // parent
            expect(parent.parentNode).to.not.exist;
            expect(parent.nextSibling).to.not.exist;
            expect(parent.childNodes.length).to.eql(2);
            expect(parent.childNodes[0]).to.eql(child);
            expect(parent.childNodes[1]).to.eql(newChild);

            // child
            expect(child.parentNode).to.eql(parent);
            expect(child.childNodes.length).to.eql(0);
            expect(child.nextSibling).to.eql(newChild);

            // new child
            expect(newChild.parentNode).to.eql(parent);
            expect((newChild.childNodes || []).length).to.eql(0);
            expect(newChild.nextSibling).to.not.exist;

        });

    });

});

const xmlParser = new XmlParser();

function createDomNode(xml: string, removeWhiteSpace = false): Node {
    if (removeWhiteSpace)
        xml = xml.replace(/\s/g, '');
    const document = xmlParser.domParse(xml);
    return document.documentElement;
}