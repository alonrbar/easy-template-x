import { OpenXmlPart } from "src/office";
import { XmlGeneralNode, XmlTextNode } from "src/xml";
import { TagPlacement } from "src/compilation/tag";

export type DelimiterMark = TextNodeDelimiterMark | AttributeDelimiterMark;

export interface BaseDelimiterMark {
    openXmlPart?: OpenXmlPart;    
    /**
     * Is this an open delimiter or a close delimiter
     */
    isOpen: boolean;
}

export interface TextNodeDelimiterMark extends BaseDelimiterMark {
    placement: typeof TagPlacement.TextNode;
    xmlTextNode: XmlTextNode;
    /**
     * Index inside the text node
     */
    index: number;
}

export interface AttributeDelimiterMark extends BaseDelimiterMark {
    placement: typeof TagPlacement.Attribute;
    xmlNode: XmlGeneralNode;
    attributeName: string;
    /**
     * Index inside the attribute
     */
    index: number;
}
