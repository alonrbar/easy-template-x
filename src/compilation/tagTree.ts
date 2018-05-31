import { TagType } from "./tag";

export class TagTree {
    public name: string;
    /**
     * The final value to output to the result document.
     * The value should NOT be xml encoded.
     */
    public value?: string;
    public type: TagType;
    public startNode: Node;
    public endNode: Node;
    public parent: TagTree;
    public children: TagTree[] = [];

    constructor(initial?: Partial<TagTree>) {
        Object.assign(this, initial);
    }
}