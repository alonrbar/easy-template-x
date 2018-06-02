import { TagType } from "./tag";

export class TagTree {
    public name: string;
    public type: TagType;
    public startNode: Node;
    public startIndex: number;
    public endNode: Node;
    public endIndex: number;
    public parent: TagTree;
    public children: TagTree[] = [];

    constructor(initial?: Partial<TagTree>) {
        Object.assign(this, initial);
    }
}