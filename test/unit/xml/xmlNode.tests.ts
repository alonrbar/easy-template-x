import { TEXT_NODE_NAME, XmlNode, XmlNodeType, XmlParser } from "src/xml";
import { parseXml } from "../../testUtils";

describe(nameof(XmlNode), () => {
    describe(nameof(XmlNode.serialize), () => {
        it("serializes a simple text node", () => {
            const node = XmlNode.createTextNode("hello");
            const str = XmlNode.serialize(node);
            expect(str).toEqual("hello");
        });

        it("serializes a text node with null value as an empty string", () => {
            const node = XmlNode.createTextNode(null);
            const str = XmlNode.serialize(node);
            expect(str).toEqual("");
        });

        it("serializes a text node with undefined value as an empty string", () => {
            const node = XmlNode.createTextNode(undefined);
            const str = XmlNode.serialize(node);
            expect(str).toEqual("");
        });
    });

    describe(nameof(XmlNode.fromDomNode), () => {
        it("creates a valid xml node from a single dom node", () => {
            const domNode = createDomNode("<my-node/>");
            const xmlNode = XmlNode.fromDomNode(domNode);

            expect(xmlNode.nodeName).toEqual("my-node");
            expect(xmlNode.nodeType).toEqual(XmlNodeType.General);
            expect(xmlNode.parentNode).toBeFalsy();
            expect(xmlNode.childNodes.length).toEqual(0);
            expect(xmlNode.nextSibling).toBeFalsy();
        });

        it("creates a valid xml tree from a dom node with a single child", () => {
            const domNode = createDomNode(
                `
                <root>
                    <child></child>
                </root>
            `,
                true
            );
            const xmlNode = XmlNode.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).toEqual("root");
            expect(xmlNode.nodeType).toEqual(XmlNodeType.General);
            expect(root.parentNode).toBeFalsy();
            expect(root.childNodes.length).toEqual(1);
            expect(root.nextSibling).toBeFalsy();

            // child
            const child = root.childNodes[0];
            expect(child.nodeName).toEqual("child");
            expect(xmlNode.nodeType).toEqual(XmlNodeType.General);
            expect(child.parentNode).toEqual(root);
            expect(child.childNodes.length).toEqual(0);
            expect(child.nextSibling).toBeFalsy();
        });

        it("creates a valid xml tree from a mixed tree", () => {
            const domNode = createDomNode(
                `
                <root>
                    <child></child>
                    <child></child>
                    <other-child>hi</other-child>
                </root>
            `,
                true
            );
            const xmlNode = XmlNode.fromDomNode(domNode);

            // root
            const root = xmlNode;
            expect(root.nodeName).toEqual("root");
            expect(root.nodeType).toEqual(XmlNodeType.General);
            expect(root.parentNode).toBeFalsy();
            expect(root.childNodes.length).toEqual(3);
            expect(root.nextSibling).toBeFalsy();

            const child1 = root.childNodes[0];
            const child2 = root.childNodes[1];
            const child3 = root.childNodes[2];
            const grandchild1 = root.childNodes[2].childNodes[0];

            // child #1
            expect(child1.nodeName).toEqual("child");
            expect(child1.nodeType).toEqual(XmlNodeType.General);
            expect(child1.parentNode).toEqual(root);
            expect(child1.childNodes.length).toEqual(0);
            expect(child1.nextSibling).toEqual(child2);

            // child #2
            expect(child2.nodeName).toEqual("child");
            expect(child2.nodeType).toEqual(XmlNodeType.General);
            expect(child2.parentNode).toEqual(root);
            expect(child2.childNodes.length).toEqual(0);
            expect(child2.nextSibling).toEqual(child3);

            // child #3
            expect(child3.nodeName).toEqual("other-child");
            expect(child3.nodeType).toEqual(XmlNodeType.General);
            expect(child3.parentNode).toEqual(root);
            expect(child3.childNodes.length).toEqual(1);
            expect(child3.nextSibling).toBeFalsy();

            // grandchild #3
            expect(grandchild1.nodeName).toEqual(TEXT_NODE_NAME);
            expect(grandchild1.nodeType).toEqual(XmlNodeType.Text);
            expect(grandchild1.parentNode).toEqual(child3);
            expect(grandchild1.childNodes).toBeFalsy();
            expect(grandchild1.nextSibling).toBeFalsy();
        });
    });

    describe(nameof(XmlNode.insertBefore), () => {
        it("inserts before an only child", () => {
            const parent = parseXml(
                `
                <root>
                    <child></child>
                </root>
            `,
                true
            );

            const child = parent.childNodes[0];
            const newChild: XmlNode = {
                nodeName: "new-child",
                nodeType: XmlNodeType.General
            };

            XmlNode.insertBefore(newChild, child);

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

    describe(nameof(XmlNode.insertChild), () => {
        it("inserts into an empty child collection", () => {
            const parent = parseXml(`<root></root>`, true);

            const child: XmlNode = {
                nodeName: "new-child",
                nodeType: XmlNodeType.General
            };

            XmlNode.insertChild(parent, child, 0);

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

    describe(nameof(XmlNode.appendChild), () => {
        it("appends a child", () => {
            const parent = parseXml(
                `
                <root>
                    <child></child>
                </root>
            `,
                true
            );

            const child = parent.childNodes[0];
            const newChild: XmlNode = {
                nodeName: "new-child",
                nodeType: XmlNodeType.General
            };

            XmlNode.appendChild(parent, newChild);

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

    describe(nameof(XmlNode.getPath), () => {
        it("gets paths", () => {
            const xml = parseXml(
                `
                <root>
                    <child>
                        <grandchild></grandchild>
                    </child>
                </root>
            `,
                true
            );

            expect(XmlNode.getPath(xml)).toBe("/root");
            expect(XmlNode.getPath(xml.childNodes[0])).toBe("/root/child");
            expect(XmlNode.getPath(xml.childNodes[0].childNodes[0])).toBe(
                "/root/child/grandchild"
            );
        });
    });
});

const xmlParser = new XmlParser();

function createDomNode(xml: string, removeWhiteSpace = false): Node {
    if (removeWhiteSpace) xml = xml.replace(/\s/g, "");
    const document = xmlParser.domParse(xml);
    return document.documentElement;
}
