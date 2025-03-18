import { OpenXmlPart } from "src/office";
import { XmlTextNode } from "src/xml";

export interface DelimiterMark {

    xmlTextNode: XmlTextNode;
    openXmlPart?: OpenXmlPart;
    /**
     * Index inside the text node
     */
    index: number;
    /**
     * Is this an open delimiter or a close delimiter
     */
    isOpen: boolean;
}