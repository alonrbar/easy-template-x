import { IMap } from '../types';
export declare enum XmlNodeType {
    Text = "Text",
    General = "General"
}
export declare type XmlNode = XmlTextNode | XmlGeneralNode;
export interface XmlNodeBase {
    nodeType: XmlNodeType;
    nodeName: string;
    parentNode?: XmlNode;
    childNodes?: XmlNode[];
    nextSibling?: XmlNode;
}
export declare const TEXT_NODE_NAME = "#text";
export interface XmlTextNode extends XmlNodeBase {
    nodeType: XmlNodeType.Text;
    nodeName: typeof TEXT_NODE_NAME;
    textContent: string;
}
export interface XmlGeneralNode extends XmlNodeBase {
    nodeType: XmlNodeType.General;
    attributes?: IMap<string>;
}
export declare const XmlNode: {
    createTextNode(text?: string): XmlTextNode;
    createGeneralNode(name: string): XmlGeneralNode;
    encodeValue(str: string): string;
    serialize(node: XmlNode): string;
    fromDomNode(domNode: Node): XmlNode;
    isTextNode(node: XmlNode): node is XmlTextNode;
    cloneNode<T extends XmlNode>(node: T, deep: boolean): T;
    insertBefore(newNode: XmlNode, referenceNode: XmlNode): void;
    insertAfter(newNode: XmlNode, referenceNode: XmlNode): void;
    insertChild(parent: XmlNode, child: XmlNode, childIndex: number): void;
    appendChild(parent: XmlNode, child: XmlNode): void;
    remove(node: XmlNode): void;
    removeChild: typeof removeChild;
    lastTextChild(node: XmlNode): XmlTextNode;
    removeSiblings(from: XmlNode, to: XmlNode): XmlNode[];
    splitByChild(parent: XmlNode, child: XmlNode, removeChild: boolean): [XmlNode, XmlNode];
    findParent(node: XmlNode, predicate: (node: XmlNode) => boolean): XmlNode;
    findParentByName(node: XmlNode, nodeName: string): XmlNode;
    findChildByName(node: XmlNode, childName: string): XmlNode;
    siblingsInRange(firstNode: XmlNode, lastNode: XmlNode): XmlNode[];
    removeEmptyTextNodes(node: XmlNode): void;
};
declare function removeChild(parent: XmlNode, child: XmlNode): XmlNode;
declare function removeChild(parent: XmlNode, childIndex: number): XmlNode;
export {};
