export enum XmlNodeType {
    Text = "Text",
    Other = "Other"
}

export interface XmlNode {
    nodeType: XmlNodeType;
    parentNode: XmlNode;
}

export interface XmlTextNode extends XmlNode {
    nodeType: XmlNodeType.Text;
    textContent: string;
}

export interface XmlOtherNode extends XmlNode {
    nodeType: XmlNodeType.Other;
    name: string;
    attributes: XmlAttribute[];
    childNodes: XmlNode[];
}

export interface XmlAttribute {
    name: string;
    value: string;
}

// tslint:disable-next-line:no-namespace
export namespace XmlNode {
    export function cloneNode(node: XmlNode, deep: boolean): XmlNode {
        return node;
    }
}