import { XmlTextNode } from "../xml";
export interface DelimiterMark {
    xmlTextNode: XmlTextNode;
    index: number;
    isOpen: boolean;
}
