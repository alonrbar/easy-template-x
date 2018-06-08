import { expect } from 'chai';
import { XmlNode, XmlNodeType } from 'src/xmlNode';
import { XmlParser } from 'src/xmlParser';

// tslint:disable:no-unused-expression

describe(nameof(XmlNode), () => {

    describe(nameof(XmlNode.fromDomNode), () => {

        it('creates a valid xml node from a single dom node', () => {

            const domNode = createDomNode('<my-node/>');
            const xmlNode = XmlNode.fromDomNode(domNode);

            expect(xmlNode.nodeName).to.eql('my-node');
            expect(xmlNode.nodeType).to.eql(XmlNodeType.General);
            expect(!!xmlNode.parentNode).to.be.false;
            expect(xmlNode.childNodes.length).to.eql(0);
            expect(!!xmlNode.nextSibling).to.be.false;
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
            expect(root.nodeType).to.eql(XmlNodeType.General);
            expect(!!root.parentNode).to.be.false;
            expect(root.childNodes.length).to.eql(1);
            expect(!!root.nextSibling).to.be.false;

            // child
            const child = root.childNodes[0];
            expect(child.nodeName).to.eql('child');
            expect(child.nodeType).to.eql(XmlNodeType.General);
            expect(child.parentNode).to.eql(root);
            expect(child.childNodes.length).to.eql(0);
            expect(!!child.nextSibling).to.be.false;
        });

        it('creates a valid xml tree from a dom node with a three child nodes', () => {
            const domNode = createDomNode(`
                <root>
                    <child></child>
                    <child></child>
                    <other-child></other-child>
                </root>
            `, true);
            const xmlNode = XmlNode.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).to.eql('root');
            expect(root.nodeType).to.eql(XmlNodeType.General);
            expect(!!root.parentNode).to.be.false;
            expect(root.childNodes.length).to.eql(3);
            expect(!!root.nextSibling).to.be.false;

            const child1 = root.childNodes[0];
            const child2 = root.childNodes[1];
            const child3 = root.childNodes[2];
            
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
            expect(child3.childNodes.length).to.eql(0);
            expect(!!child3.nextSibling).to.be.false;
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