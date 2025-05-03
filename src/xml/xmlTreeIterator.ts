import { InternalError } from "src/errors";
import { XmlDepthTracker } from "./xmlDepthTracker";
import { XmlNode } from "./xmlNode";

export class XmlTreeIterator<T extends XmlNode = XmlNode> {

    public get node(): T {
        return this._current as T;
    }

    private _current: XmlNode;
    private readonly depthTracker: XmlDepthTracker;

    constructor(initial: XmlNode, maxDepth: number) {
        if (!initial) {
            throw new InternalError("Initial node is required");
        }
        if (!maxDepth) {
            throw new InternalError("Max depth is required");
        }

        this._current = initial;
        this.depthTracker = new XmlDepthTracker(maxDepth);
    }

    public next(): XmlNode {
        if (!this._current) {
            return null;
        }

        this._current = this.findNextNode(this._current);
        return this._current;
    }

    public setCurrent(node: XmlNode): void {
        this._current = node;
    }

    private findNextNode(node: XmlNode): XmlNode {

        // Children
        if (node.childNodes && node.childNodes.length) {
            this.depthTracker.increment();
            return node.childNodes[0];
        }

        // Siblings
        if (node.nextSibling)
            return node.nextSibling;

        // Parent sibling
        while (node.parentNode) {

            if (node.parentNode.nextSibling) {
                this.depthTracker.decrement();
                return node.parentNode.nextSibling;
            }

            // Go up
            this.depthTracker.decrement();
            node = node.parentNode;
        }

        return null;
    }

}
