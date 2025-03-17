import { IMap } from "src/types";

export const XmlNodeType = Object.freeze({
    Text: "Text",
    General: "General",
    Comment: "Comment",
} as const);

export type XmlNodeType = typeof XmlNodeType[keyof typeof XmlNodeType];

export type XmlNode = XmlTextNode | XmlGeneralNode | XmlCommentNode;

export interface XmlNodeBase {
    nodeType: XmlNodeType;
    nodeName: string;
    parentNode?: XmlNode;
    childNodes?: XmlNode[];
    nextSibling?: XmlNode;
}

export const TEXT_NODE_NAME = '#text'; // see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName
export const COMMENT_NODE_NAME = '#comment';

export interface XmlTextNode extends XmlNodeBase {
    nodeType: typeof XmlNodeType.Text;
    nodeName: typeof TEXT_NODE_NAME;
    textContent: string;
}

export interface XmlCommentNode extends XmlNodeBase {
    nodeType: typeof XmlNodeType.Comment;
    nodeName: typeof COMMENT_NODE_NAME;
    commentContent: string;
}

export interface XmlGeneralNode extends XmlNodeBase {
    nodeType: typeof XmlNodeType.General;
    attributes?: IMap<string>;
}
