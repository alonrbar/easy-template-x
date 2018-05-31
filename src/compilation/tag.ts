export enum TagType {
    /**
     * Simple tag for straight-forward replacement.
     */
    Simple = "Simple",
    Container = "Container",
    Predefined = "Predefined"
}

export enum TagSubType {

    //
    // container tags
    //

    Condition = "Condition",
    Loop = "Loop",

    //
    // pre-defined tags
    //

    NewPage = "NewPage"
}

export class Tag {
    public type: TagType;
    public subType?: TagSubType;
    public startNode: Node;
    public endNode: Node;
}