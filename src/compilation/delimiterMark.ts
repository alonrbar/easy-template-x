import { XmlTextNode } from "../xml";

export interface DelimiterMark {

    xmlTextNode: XmlTextNode;
    /**
     * Index inside the text node
     */
    index: number;
    /**
     * Is this an open delimiter or a close delimiter
     */
    isOpen: boolean;
}