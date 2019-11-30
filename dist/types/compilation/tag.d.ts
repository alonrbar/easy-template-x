import { XmlTextNode } from '../xml';
export declare enum TagDisposition {
    Open = "Open",
    Close = "Close",
    SelfClosed = "SelfClosed"
}
export interface Tag {
    name: string;
    rawText: string;
    disposition: TagDisposition;
    xmlTextNode: XmlTextNode;
}
