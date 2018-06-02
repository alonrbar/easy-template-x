
export enum TagType {
    /**
     * Simple tag for straight-forward replacement.
     */
    Simple = "Simple",
    
    //
    // container tags
    //

    Loop = "Loop",

    //
    // pre-defined tags
    //

    NewPage = "NewPage"
}

export enum TagDisposition {
    Opened = "Opened",
    Closed = "Closed",
    SelfClosed = "SelfClosed"
}

export class Tag {
    public name: string;
    public rawText: string;
    public type: TagType;
    public disposition: TagDisposition;
    public xmlNode: Node;

    constructor(initial?: Partial<Tag>) {
        Object.assign(this, initial);
    }
}