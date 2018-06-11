import { XmlTextNode } from '../xmlNode';

export enum TagDisposition {
    Open = "Open",
    Close = "Close",
    SelfClosed = "SelfClosed"
}

export class Tag {
    public name: string;
    public prefix: string;
    public rawText: string;
    public disposition: TagDisposition;
    public xmlTextNode: XmlTextNode;

    constructor(initial?: Partial<Tag>) {
        Object.assign(this, initial);
    }
}

export interface TagPrefix {
    prefix: string;
    tagDisposition: TagDisposition;
}