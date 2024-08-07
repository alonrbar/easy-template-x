import { IMap } from '../types';
import { XmlTextNode } from '../xml';

export enum TagDisposition {
    Open = "Open",
    Close = "Close",
    SelfClosed = "SelfClosed"
}

export interface Tag {
    name: string;
    options?: IMap<any>;
    /**
     * The full tag text, for instance: "{#my-tag}".
     */
    rawText: string;
    disposition: TagDisposition;
    xmlTextNode: XmlTextNode;
}
