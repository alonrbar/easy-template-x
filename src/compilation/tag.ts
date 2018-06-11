import { XmlTextNode } from '../xmlNode';

export enum TagType {    
    Simple = "Simple",
    Loop = "Loop",
    RawXml = "RawXml"
}

export enum TagDisposition {
    Open = "Open",
    Close = "Close",
    SelfClosed = "SelfClosed"
}

export class Tag {
    public name: string;
    public rawText: string;
    public type: TagType;
    public disposition: TagDisposition;
    public xmlTextNode: XmlTextNode;

    constructor(initial?: Partial<Tag>) {
        Object.assign(this, initial);
    }
}