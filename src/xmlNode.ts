import { MissingArgumentError } from './errors';
import { last } from './utils';

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
    nodeName: string;
    attributes?: XmlAttribute[];
}

export interface XmlAttribute {
    name: string;
    value: string;
}

// tslint:disable-next-line:no-namespace
export namespace XmlNode {

    //
    // serialization
    //

    /**
     * Encode string to make it safe to use inside xml tags.
     * 
     * https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
     */
    export function encodeValue(str: string): string {
        if (str === null || str === undefined)
            throw new MissingArgumentError(nameof(str));
        if (typeof str !== 'string')
            throw new TypeError(`Expected a string, got '${(str as any).constructor.name}'.`);

        return str.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
            return '';
        });
    }

    export function serialize(node: XmlNode): string {
        throw new Error('not implemented');
    }

    /**
     * The conversion is always deep.
     */
    export function fromDomNode(domNode: Node): XmlNode {
        const xmlNode: XmlNode = ({} as any);

        // basic properties
        if (domNode.nodeType === domNode.TEXT_NODE) {

            xmlNode.nodeType = XmlNodeType.Text;
            (xmlNode as XmlTextNode).textContent = domNode.textContent;

        } else {

            xmlNode.nodeType = XmlNodeType.Other;
            (xmlNode as XmlOtherNode).nodeName = domNode.nodeName;

            // attributes
            if (domNode.nodeType === domNode.ELEMENT_NODE) {
                const attributes = (domNode as Element).attributes;
                if (attributes) {
                    (xmlNode as XmlOtherNode).attributes = [];
                    for (let i = 0; i < attributes.length; i++) {
                        const curAttribute = attributes.item(i);
                        (xmlNode as XmlOtherNode).attributes.push({
                            name: curAttribute.name,
                            value: curAttribute.value
                        });
                    }
                }
            }
        }

        // children
        if (domNode.childNodes) {
            xmlNode.childNodes = [];
            let prevChild: XmlNode;
            for (let i = 0; i < domNode.childNodes.length; i++) {

                // clone child
                const domChild = domNode.childNodes.item(i);
                const curChild = fromDomNode(domChild);

                // set references                
                xmlNode.childNodes.push(curChild);
                curChild.parentNode = xmlNode;
                if (prevChild) {
                    prevChild.nextSibling = curChild;
                }
                prevChild = curChild;
            }
        }

        return xmlNode as XmlNode;
    }

    //
    // core functions
    //

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
            const clone = cloneNodeDeep(node);
            clone.parentNode = null;
            return clone;
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

    //
    // utility functions
    //

    /**
     * Remove sibling nodes between 'from' and 'to' excluding both.
     * Return the removed nodes.
     */
    export function removeSiblings(from: XmlNode, to: XmlNode): XmlNode[] {
        if (from === to)
            return [];

        const removed: XmlNode[] = [];

        from = from.nextSibling;
        while (from !== to) {
            const removeMe = from;
            from = from.nextSibling;

            XmlNode.remove(removeMe);
            removed.push(removeMe);
        }

        return removed;
    }

    /**
     * Modifies the original node and returns the other part.
     *
     * @param root The node to split
     * @param markerNode The node that marks the split position. 
     * @param afterMarker If true everything the marker node will be extracted
     * into the result node. Else, everything before it will be extracted
     * instead.
     */
    export function splitByChild(root: XmlNode, markerNode: XmlNode, afterMarker: boolean, removeMarkerNode: boolean): XmlNode {
        const path = getDescendantPath(root, markerNode);

        let clone = XmlNode.cloneNode(root, false);

        const childIndex = path[0] + (afterMarker ? 1 : -1);
        if (afterMarker) {

            // after marker
            while (childIndex < root.childNodes.length) {
                const curChild = root.childNodes[childIndex];
                XmlNode.remove(curChild);
                XmlNode.appendChild(clone, curChild);
            }

            if (removeMarkerNode) {
                XmlNode.remove(last(root.childNodes));
            }
        } else {

            // before marker
            const stopChild = root.childNodes[childIndex];
            let curChild: XmlNode;
            do {
                curChild = root.childNodes[0];
                XmlNode.remove(curChild);
                XmlNode.appendChild(clone, curChild);

            } while (curChild !== stopChild);

            if (removeMarkerNode) {
                XmlNode.remove(root.childNodes[0]);
            }
        }

        return clone;
    }

    //
    // private functions
    //

    function cloneNodeDeep(original: XmlNode): XmlNode {

        const clone: XmlNode = ({} as any);

        // basic properties
        clone.nodeType = original.nodeType;
        if (original.nodeType === XmlNodeType.Text) {
            (clone as XmlTextNode).textContent = (original as XmlTextNode).textContent;
        } else {
            (clone as XmlOtherNode).nodeName = (original as XmlOtherNode).nodeName;
            const attributes = (original as XmlOtherNode).attributes;
            if (attributes) {
                (clone as XmlOtherNode).attributes = attributes.map(attr => ({ name: attr.name, value: attr.value }));
            }
        }

        // children
        if (original.childNodes) {
            clone.childNodes = [];
            let prevChildClone: XmlNode;
            for (const child of original.childNodes) {

                // clone child
                const childClone = cloneNodeDeep(child);

                // set references                
                clone.childNodes.push(childClone);
                childClone.parentNode = clone;
                if (prevChildClone) {
                    prevChildClone.nextSibling = childClone;
                }
                prevChildClone = childClone;
            }
        }

        return clone;
    }

    function getDescendantPath(root: XmlNode, descendant: XmlNode): number[] {
        const path: number[] = [];

        let node = descendant;
        while (node !== root) {
            const parent = node.parentNode;
            if (!parent)
                throw new Error(`Argument ${nameof(descendant)} is not a descendant of ${nameof(root)}`);

            const curChildIndex = parent.childNodes.indexOf(node);
            path.push(curChildIndex);

            node = parent;
        }

        return path.reverse();
    }
}