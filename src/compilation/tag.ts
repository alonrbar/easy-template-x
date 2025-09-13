import { IMap } from "src/types";
import { XmlGeneralNode, XmlTextNode } from "src/xml";

export const TagDisposition = Object.freeze({
    Open: "Open",
    Close: "Close",
    SelfClosed: "SelfClosed"
} as const);

export type TagDisposition = typeof TagDisposition[keyof typeof TagDisposition];

export const TagPlacement = Object.freeze({
    TextNode: "TextNode",
    Attribute: "Attribute",
} as const);

export type TagPlacement = typeof TagPlacement[keyof typeof TagPlacement];

export type Tag = TextNodeTag | AttributeTag;

export interface BaseTag {
    name: string;
    options?: IMap<any>;
    /**
     * The full tag text, for instance: "{#my-tag}".
     */
    rawText: string;
    disposition: TagDisposition;
}

export interface TextNodeTag extends BaseTag {
    placement: typeof TagPlacement.TextNode;
    xmlTextNode: XmlTextNode;
}

export interface AttributeTag extends BaseTag {
    placement: typeof TagPlacement.Attribute;
    xmlNode: XmlGeneralNode;
    attributeName: string;
}
