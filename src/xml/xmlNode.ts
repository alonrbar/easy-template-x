import { MissingArgumentError } from '../errors';
import { IMap } from '../types';
import { last } from '../utils';

export enum XmlNodeType {
    Text = "Text",
    General = "General"
}

export type XmlNode = XmlTextNode | XmlGeneralNode;

export interface XmlNodeBase {
    nodeType: XmlNodeType;
    nodeName: string;
    parentNode?: XmlNode;
    childNodes?: XmlNode[];
    nextSibling?: XmlNode;
}

export const TEXT_NODE_NAME = '#text'; // see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName

export interface XmlTextNode extends XmlNodeBase {
    nodeType: XmlNodeType.Text;
    nodeName: typeof TEXT_NODE_NAME;
    textContent: string;
}

export interface XmlGeneralNode extends XmlNodeBase {
    nodeType: XmlNodeType.General;
    attributes?: IMap<string>;
}

export const XmlNode = {

    //
    // factories
    //

    createTextNode(text?: string): XmlTextNode {
        return {
            nodeType: XmlNodeType.Text,
            nodeName: TEXT_NODE_NAME,
            textContent: text
        };
    },

    createGeneralNode(name: string): XmlGeneralNode {
        return {
            nodeType: XmlNodeType.General,
            nodeName: name
        };
    },

    //
    // serialization
    //

    /**
     * Encode string to make it safe to use inside xml tags.
     *
     * https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
     */
    encodeValue(str: string): string {
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
    },

    serialize(node: XmlNode): string {
        if (this.isTextNode(node))
            return this.encodeValue(node.textContent || '');

        // attributes
        let attributes = '';
        if (node.attributes) {
            const attributeNames = Object.keys(node.attributes);
            if (attributeNames.length) {
                attributes = ' ' + attributeNames
                    .map(name => `${name}="${node.attributes[name]}"`)
                    .join(' ');
            }
        }

        // open tag
        const hasChildren = (node.childNodes || []).length > 0;
        const suffix = hasChildren ? '' : '/';
        const openTag = `<${node.nodeName}${attributes}${suffix}>`;

        let xml: string;

        if (hasChildren) {

            // child nodes
            const childrenXml = node.childNodes
                .map(child => this.serialize(child))
                .join('');

            // close tag
            const closeTag = `</${node.nodeName}>`;

            xml = openTag + childrenXml + closeTag;
        } else {
            xml = openTag;
        }

        return xml;
    },

    /**
     * The conversion is always deep.
     */
    fromDomNode(domNode: Node): XmlNode {
        let xmlNode: XmlNode;

        // basic properties
        if (domNode.nodeType === domNode.TEXT_NODE) {

            xmlNode = this.createTextNode(domNode.textContent);

        } else {

            xmlNode = this.createGeneralNode(domNode.nodeName);

            // attributes
            if (domNode.nodeType === domNode.ELEMENT_NODE) {
                const attributes = (domNode as Element).attributes;
                if (attributes) {
                    (xmlNode as XmlGeneralNode).attributes = {};
                    for (let i = 0; i < attributes.length; i++) {
                        const curAttribute = attributes.item(i);
                        (xmlNode as XmlGeneralNode).attributes[curAttribute.name] = curAttribute.value;
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
                const curChild = this.fromDomNode(domChild);

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
    },

    //
    // core functions
    //

    isTextNode(node: XmlNode): node is XmlTextNode {
        if (node.nodeType === XmlNodeType.Text || node.nodeName === TEXT_NODE_NAME) {
            if (!(node.nodeType === XmlNodeType.Text && node.nodeName === TEXT_NODE_NAME)) {
                throw new Error(`Invalid text node. Type: '${node.nodeType}', Name: '${node.nodeName}'.`);
            }
            return true;
        }
        return false;
    },

    cloneNode<T extends XmlNode>(node: T, deep: boolean): T {
        if (!node)
            throw new MissingArgumentError(nameof(node));

        if (!deep) {
            const clone = Object.assign({}, node);
            clone.parentNode = null;
            clone.childNodes = (node.childNodes ? [] : null);
            clone.nextSibling = null;
            return clone;
        } else {
            const clone = cloneNodeDeep(node);
            clone.parentNode = null;
            return clone;
        }
    },

    /**
     * Insert the node as a new sibling, before the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    insertBefore(newNode: XmlNode, referenceNode: XmlNode): void {
        if (!newNode)
            throw new MissingArgumentError(nameof(newNode));
        if (!referenceNode)
            throw new MissingArgumentError(nameof(referenceNode));

        if (!referenceNode.parentNode)
            throw new Error(`'${nameof(referenceNode)}' has no parent`);

        const childNodes = referenceNode.parentNode.childNodes;
        const beforeNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, beforeNodeIndex);
    },

    /**
     * Insert the node as a new sibling, after the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    insertAfter(newNode: XmlNode, referenceNode: XmlNode): void {
        if (!newNode)
            throw new MissingArgumentError(nameof(newNode));
        if (!referenceNode)
            throw new MissingArgumentError(nameof(referenceNode));

        if (!referenceNode.parentNode)
            throw new Error(`'${nameof(referenceNode)}' has no parent`);

        const childNodes = referenceNode.parentNode.childNodes;
        const referenceNodeIndex = childNodes.indexOf(referenceNode);
        XmlNode.insertChild(referenceNode.parentNode, newNode, referenceNodeIndex + 1);
    },

    insertChild(parent: XmlNode, child: XmlNode, childIndex: number): void {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (XmlNode.isTextNode(parent))
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
        child.parentNode = parent;

        const childAfter = parent.childNodes[childIndex];
        child.nextSibling = childAfter;

        if (childIndex > 0) {
            const childBefore = parent.childNodes[childIndex - 1];
            childBefore.nextSibling = child;
        }

        // append
        parent.childNodes.splice(childIndex, 0, child);
    },

    appendChild(parent: XmlNode, child: XmlNode): void {
        if (!parent)
            throw new MissingArgumentError(nameof(parent));
        if (XmlNode.isTextNode(parent))
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
    },

    /**
     * Removes the node from it's parent.
     *
     * * **Note**: It is more efficient to call removeChild(parent, childIndex).
     */
    remove(node: XmlNode): void {
        if (!node)
            throw new MissingArgumentError(nameof(node));

        if (!node.parentNode)
            throw new Error('Node has no parent');

        removeChild(node.parentNode, node);
    },

    removeChild,

    //
    // utility functions
    //

    /**
     * Gets the last direct child text node if it exists. Otherwise creates a
     * new text node, appends it to 'node' and return the newly created text
     * node.
     *
     * The function also makes sure the returned text node has a valid string
     * value.
     */
    lastTextChild(node: XmlNode): XmlTextNode {
        if (XmlNode.isTextNode(node)) {
            return node;
        }

        // existing text nodes
        if (node.childNodes) {
            const allTextNodes = node.childNodes.filter(child => XmlNode.isTextNode(child)) as XmlTextNode[];
            if (allTextNodes.length) {
                const lastTextNode = last(allTextNodes);
                if (!lastTextNode.textContent)
                    lastTextNode.textContent = '';
                return lastTextNode;
            }
        }

        // create new text node
        const newTextNode: XmlTextNode = {
            nodeType: XmlNodeType.Text,
            nodeName: TEXT_NODE_NAME,
            textContent: ''
        };

        XmlNode.appendChild(node, newTextNode);
        return newTextNode;
    },

    /**
     * Remove sibling nodes between 'from' and 'to' excluding both.
     * Return the removed nodes.
     */
    removeSiblings(from: XmlNode, to: XmlNode): XmlNode[] {
        if (from === to)
            return [];

        const removed: XmlNode[] = [];
        let lastRemoved: XmlNode;
        from = from.nextSibling;
        while (from !== to) {
            const removeMe = from;
            from = from.nextSibling;

            XmlNode.remove(removeMe);
            removed.push(removeMe);

            if (lastRemoved)
                lastRemoved.nextSibling = removeMe;
            lastRemoved = removeMe;
        }

        return removed;
    },

    /**
     * Split the original node into two sibling nodes. Returns both nodes.
     *
     * @param parent The node to split
     * @param child The node that marks the split position.
     * @param removeChild Should this method remove the child while splitting.
     *
     * @returns Two nodes - `left` and `right`. If the `removeChild` argument is
     * `false` then the original child node is the first child of `right`.
     */
    splitByChild(parent: XmlNode, child: XmlNode, removeChild: boolean): [XmlNode, XmlNode] {

        if (child.parentNode != parent)
            throw new Error(`Node '${nameof(child)}' is not a direct child of '${nameof(parent)}'.`);

        // create childless clone 'left'
        const left = XmlNode.cloneNode(parent, false);
        if (parent.parentNode) {
            XmlNode.insertBefore(left, parent);
        }
        const right = parent;

        // move nodes from 'right' to 'left'
        let curChild = right.childNodes[0];
        while (curChild != child) {
            XmlNode.remove(curChild);
            XmlNode.appendChild(left, curChild);
            curChild = right.childNodes[0];
        }

        // remove child
        if (removeChild) {
            XmlNode.removeChild(right, 0);
        }

        return [left, right];
    },

    findParent(node: XmlNode, predicate: (node: XmlNode) => boolean): XmlNode {

        while (node) {

            if (predicate(node))
                return node;

            node = node.parentNode;
        }

        return null;
    },

    findParentByName(node: XmlNode, nodeName: string): XmlNode {
        return XmlNode.findParent(node, n => n.nodeName === nodeName);
    },

    findChildByName(node: XmlNode, childName: string): XmlNode {
        if (!node)
            return null;
        return (node.childNodes || []).find(child => child.nodeName === childName);
    },

    /**
     * Returns all siblings between 'firstNode' and 'lastNode' inclusive.
     */
    siblingsInRange(firstNode: XmlNode, lastNode: XmlNode): XmlNode[] {
        if (!firstNode)
            throw new MissingArgumentError(nameof(firstNode));
        if (!lastNode)
            throw new MissingArgumentError(nameof(lastNode));

        const range: XmlNode[] = [];
        let curNode = firstNode;
        while (curNode && curNode !== lastNode) {
            range.push(curNode);
            curNode = curNode.nextSibling;
        }

        if (!curNode)
            throw new Error('Nodes are not siblings.');

        range.push(lastNode);
        return range;
    },

    /**
     * Recursively removes text nodes leaving only "general nodes".
     */
    removeEmptyTextNodes(node: XmlNode): void {
        recursiveRemoveEmptyTextNodes(node);
    },
};

//
// overloaded functions
//

/**
 * Remove a child node from it's parent. Returns the removed child.
 *
 * * **Note:** Prefer calling with explicit index.
 */
function removeChild(parent: XmlNode, child: XmlNode): XmlNode;
/**
 * Remove a child node from it's parent. Returns the removed child.
 */
function removeChild(parent: XmlNode, childIndex: number): XmlNode;
function removeChild(parent: XmlNode, childOrIndex: XmlNode | number): XmlNode {
    if (!parent)
        throw new MissingArgumentError(nameof(parent));
    if (childOrIndex === null || childOrIndex === undefined)
        throw new MissingArgumentError(nameof(childOrIndex));

    if (!parent.childNodes || !parent.childNodes.length)
        throw new Error('Parent node has node children');

    // get child index
    let childIndex: number;
    if (typeof childOrIndex === 'number') {
        childIndex = childOrIndex;
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

//
// private functions
//

function cloneNodeDeep<T extends XmlNode>(original: T): T {

    const clone: XmlNode = ({} as any);

    // basic properties
    clone.nodeType = original.nodeType;
    clone.nodeName = original.nodeName;
    if (XmlNode.isTextNode(original)) {
        (clone as XmlTextNode).textContent = original.textContent;
    } else {
        const attributes = (original as XmlGeneralNode).attributes;
        if (attributes) {
            (clone as XmlGeneralNode).attributes = Object.assign({}, attributes);
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

    return clone as T;
}

function recursiveRemoveEmptyTextNodes(node: XmlNode): XmlNode {

    if (!node.childNodes)
        return node;

    const oldChildren = node.childNodes;
    node.childNodes = [];
    for (const child of oldChildren) {
        if (XmlNode.isTextNode(child)) {

            // https://stackoverflow.com/questions/1921688/filtering-whitespace-only-strings-in-javascript#1921694
            if (child.textContent && child.textContent.match(/\S/)) {
                node.childNodes.push(child);
            }

            continue;
        }
        const strippedChild = recursiveRemoveEmptyTextNodes(child);
        node.childNodes.push(strippedChild);
    }

    return node;
}
