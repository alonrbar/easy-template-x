import { MissingArgumentError } from './errors';

export enum XmlNodeType {
    Text = "Text",
    Other = "Other"
}

export interface XmlNode {
    nodeType: XmlNodeType;
    parentNode?: XmlNode;
    childNodes?: XmlNode[];
    nextSibling?: XmlNode;
}

export interface XmlTextNode extends XmlNode {
    nodeType: XmlNodeType.Text;
    textContent: string;
}

export interface XmlOtherNode extends XmlNode {
    nodeType: XmlNodeType.Other;
    name: string;
    attributes?: XmlAttribute[];
}

export interface XmlAttribute {
    name: string;
    value: string;
}

// tslint:disable-next-line:no-namespace
export namespace XmlNode {

    export function fromDomNode(domNode: Node, deep: boolean): XmlNode {
        throw new Error('not implemented...');
    }

    export function cloneNode(node: XmlNode, deep: boolean): XmlNode {
        if (!node)
            throw new MissingArgumentError(nameof(node));

        if (!deep) {
            const clone = Object.assign({}, node);
            clone.parentNode = null;
            clone.childNodes = null;
            clone.nextSibling = null;
            return clone;
        } else {
            throw new Error('not implemented...');
        }
    }

    /**
     * Insert the node as a new sibling, before the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    export function insertBefore(newNode: XmlNode, referenceNode: XmlNode): void {
        if (!newNode)
            throw new MissingArgumentError(nameof(newNode));
        if (!referenceNode)
            throw new MissingArgumentError(nameof(referenceNode));

        if (!referenceNode.parentNode)
            throw new Error(`'${referenceNode}' has no parent`);

        const childNodes = referenceNode.parentNode.childNodes;
        const beforeNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, beforeNodeIndex);
    }

    /**
     * Removes the node from it's parent.
     */
    export function remove(node: XmlNode): void {
        if (!node)
            throw new MissingArgumentError(nameof(node));

        if (!node.parentNode)
            throw new Error('Node has no parent');

        removeChild(node.parentNode, node);
    }

    export function removeChild(parent: XmlNode, child: XmlNode): XmlNode;
    export function removeChild(parent: XmlNode, childIndex: number): XmlNode;
    export function removeChild(parent: XmlNode, childOrIndex: XmlNode | number): XmlNode {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (childOrIndex === null || childOrIndex === undefined)
            throw new MissingArgumentError(nameof(childOrIndex));

        if (!parent.childNodes || !parent.childNodes.length)
            throw new Error('Parent node has node children');

        // get child index
        let childIndex: number;
        if (typeof childOrIndex === 'number') {
            childIndex = childIndex;
        } else {
            childIndex = parent.childNodes.indexOf(childOrIndex);
            if (childIndex === -1)
                throw new Error('Specified child node is not a child of the specified parent');
        }

        if (childIndex >= parent.childNodes.length)
            throw new RangeError(`Child index ${childIndex} is out of range. Parent has only ${parent.childNodes.length} child nodes.`);

        // update references
        const child = parent.childNodes[childIndex];
        if (childIndex > 0) {
            const beforeChild = parent.childNodes[childIndex - 1];
            beforeChild.nextSibling = child.nextSibling;
        }
        child.parentNode = null;
        child.nextSibling = null;

        // remove and return
        return parent.childNodes.splice(childIndex, 1)[0];
    }

    export function appendChild(parent: XmlNode, child: XmlNode): void {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (parent.nodeType === XmlNodeType.Text)
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new MissingArgumentError(nameof(child));

        if (!parent.childNodes)
            parent.childNodes = [];

        // update references
        if (parent.childNodes.length) {
            const currentLastChild = parent.childNodes[parent.childNodes.length - 1];
            currentLastChild.nextSibling = child;
        }
        child.nextSibling = null;
        child.parentNode = parent;

        // append
        parent.childNodes.push(child);
    }

    export function insertChild(parent: XmlNode, child: XmlNode, childIndex: number): void {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (parent.nodeType === XmlNodeType.Text)
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new MissingArgumentError(nameof(child));

        if (!parent.childNodes)
            parent.childNodes = [];

        // revert to append
        if (childIndex === parent.childNodes.length) {
            XmlNode.appendChild(parent, child);
            return;
        }

        if (childIndex > parent.childNodes.length)
            throw new RangeError(`Child index ${childIndex} is out of range. Parent has only ${parent.childNodes.length} child nodes.`);

        // update references
        const currentChildAtIndex = parent.childNodes[childIndex];
        child.nextSibling = currentChildAtIndex.nextSibling;
        currentChildAtIndex.nextSibling = child;
        child.parentNode = parent;

        // append
        parent.childNodes.splice(childIndex, 0, child);
    }
}