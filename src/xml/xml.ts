import { DOMParser } from "@xmldom/xmldom";
import { InternalArgumentMissingError, InternalError } from "src/errors";
import { last } from "src/utils";
import { COMMENT_NODE_NAME, XmlGeneralNode, XmlNode, XmlNodeType } from "./xmlNode";
import { TEXT_NODE_NAME, XmlCommentNode } from "./xmlNode";
import { XmlTextNode } from "./xmlNode";
import { XmlTreeIterator } from "./xmlTreeIterator";
import type { IMap } from "src/types";

export type XmlNodePredicate = (node: XmlNode) => boolean;

export class XmlUtils {

    public readonly parser = new Parser();
    public readonly create = new Create();
    public readonly query = new Query();
    public readonly modify = new Modify();
}

class Parser {

    private static xmlFileHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

    /**
     * We always use the DOMParser from 'xmldom', even in the browser since it
     * handles xml namespaces more forgivingly (required mainly by the
     * RawXmlPlugin).
     */
    private static readonly parser = new DOMParser({
        errorHandler: {
            // Ignore xmldom warnings. They are often incorrect since we are
            // parsing OOXML, not HTML.
            warning: () => { },
        }
    });

    public parse(str: string): XmlNode {
        const doc = this.domParse(str);
        return xml.create.fromDomNode(doc.documentElement);
    }

    public domParse(str: string): Document {
        if (str === null || str === undefined)
            throw new InternalArgumentMissingError(nameof(str));

        return Parser.parser.parseFromString(str, "text/xml");
    }

    /**
     * Encode string to make it safe to use inside xml tags.
     *
     * https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
     */
    public encodeValue(str: string): string {
        if (str === null || str === undefined)
            throw new InternalArgumentMissingError(nameof(str));
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

    public serializeNode(node: XmlNode): string {
        if (!node)
            return '';

        if (xml.query.isTextNode(node))
            return xml.parser.encodeValue(node.textContent || '');

        if (xml.query.isCommentNode(node)) {
            return `<!-- ${xml.parser.encodeValue(node.commentContent || '')} -->`;
        }

        // attributes
        let attributes = '';
        if (node.attributes) {
            const attributeNames = Object.keys(node.attributes);
            if (attributeNames.length) {
                attributes = ' ' + attributeNames
                    .map(name => `${name}="${xml.parser.encodeValue(node.attributes[name] || '')}"`)
                    .join(' ');
            }
        }

        // open tag
        const hasChildren = (node.childNodes || []).length > 0;
        const suffix = hasChildren ? '' : '/';
        const openTag = `<${node.nodeName}${attributes}${suffix}>`;

        let xmlString: string;

        if (hasChildren) {

            // child nodes
            const childrenXml = node.childNodes
                .map(child => xml.parser.serializeNode(child))
                .join('');

            // close tag
            const closeTag = `</${node.nodeName}>`;

            xmlString = openTag + childrenXml + closeTag;
        } else {
            xmlString = openTag;
        }

        return xmlString;
    }

    public serializeFile(xmlNode: XmlNode): string {
        return Parser.xmlFileHeader + xml.parser.serializeNode(xmlNode);
    }
}

interface XmlGeneralNodeInit {
    attributes?: IMap<string>;
    childNodes?: XmlNode[];
}

class Create {

    public textNode(text?: string): XmlTextNode {
        return {
            nodeType: XmlNodeType.Text,
            nodeName: TEXT_NODE_NAME,
            textContent: text
        };
    }

    public generalNode(name: string, init?: XmlGeneralNodeInit): XmlGeneralNode {
        const node: XmlGeneralNode = {
            nodeType: XmlNodeType.General,
            nodeName: name,
        };

        if (init?.attributes) {
            node.attributes = init.attributes;
        }

        if (init?.childNodes) {
            for (const child of init.childNodes) {
                xml.modify.appendChild(node, child);
            }
        }

        return node;
    }

    public commentNode(text?: string): XmlCommentNode {
        return {
            nodeType: XmlNodeType.Comment,
            nodeName: COMMENT_NODE_NAME,
            commentContent: text
        };
    }

    public cloneNode<T extends XmlNode>(node: T, deep: boolean): T {
        if (!node)
            throw new InternalArgumentMissingError(nameof(node));

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
    }

    /**
     * The conversion is always deep.
     */
    public fromDomNode(domNode: Node): XmlNode {
        let xmlNode: XmlNode;

        // basic properties
        switch (domNode.nodeType) {
            case domNode.TEXT_NODE: {
                xmlNode = xml.create.textNode(domNode.textContent);
                break;
            }
            case domNode.COMMENT_NODE: {
                xmlNode = xml.create.commentNode(domNode.textContent?.trim());
                break;
            }
            case domNode.ELEMENT_NODE: {
                const generalNode = xmlNode = xml.create.generalNode(domNode.nodeName);
                const attributes = (domNode as Element).attributes;
                if (attributes) {
                    generalNode.attributes = {};
                    for (let i = 0; i < attributes.length; i++) {
                        const curAttribute = attributes.item(i);
                        generalNode.attributes[curAttribute.name] = curAttribute.value;
                    }
                }
                break;
            }
            default: {
                xmlNode = xml.create.generalNode(domNode.nodeName);
                break;
            }
        }

        // children
        if (domNode.childNodes) {
            xmlNode.childNodes = [];
            let prevChild: XmlNode;
            for (let i = 0; i < domNode.childNodes.length; i++) {

                // clone child
                const domChild = domNode.childNodes.item(i);
                const curChild = xml.create.fromDomNode(domChild);

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
}

class Query {

    public isTextNode(node: XmlNode): node is XmlTextNode {
        if (node.nodeType === XmlNodeType.Text || node.nodeName === TEXT_NODE_NAME) {
            if (!(node.nodeType === XmlNodeType.Text && node.nodeName === TEXT_NODE_NAME)) {
                throw new InternalError(`Invalid text node. Type: '${node.nodeType}', Name: '${node.nodeName}'.`);
            }
            return true;
        }
        return false;
    }

    public isGeneralNode(node: XmlNode): node is XmlGeneralNode {
        return node.nodeType === XmlNodeType.General;
    }

    public isCommentNode(node: XmlNode): node is XmlCommentNode {
        if (node.nodeType === XmlNodeType.Comment || node.nodeName === COMMENT_NODE_NAME) {
            if (!(node.nodeType === XmlNodeType.Comment && node.nodeName === COMMENT_NODE_NAME)) {
                throw new InternalError(`Invalid comment node. Type: '${node.nodeType}', Name: '${node.nodeName}'.`);
            }
            return true;
        }
        return false;
    }

    /**
     * Gets the last direct child text node if it exists. Otherwise creates a
     * new text node, appends it to 'node' and return the newly created text
     * node.
     *
     * The function also makes sure the returned text node has a valid string
     * value.
     */
    public lastTextChild(node: XmlNode, createIfMissing: boolean = true): XmlTextNode {
        if (!node) {
            return null;
        }

        if (xml.query.isTextNode(node)) {
            return node;
        }

        // Existing text nodes
        if (node.childNodes) {
            const allTextNodes = node.childNodes.filter(child => xml.query.isTextNode(child)) as XmlTextNode[];
            if (allTextNodes.length) {
                const lastTextNode = last(allTextNodes);
                if (!lastTextNode.textContent)
                    lastTextNode.textContent = '';
                return lastTextNode;
            }
        }

        if (!createIfMissing) {
            return null;
        }

        // Create new text node
        const newTextNode: XmlTextNode = {
            nodeType: XmlNodeType.Text,
            nodeName: TEXT_NODE_NAME,
            textContent: ''
        };

        xml.modify.appendChild(node, newTextNode);
        return newTextNode;
    }

    public findParent(node: XmlNode, predicate: (node: XmlNode) => boolean): XmlNode {

        while (node) {

            if (predicate(node))
                return node;

            node = node.parentNode;
        }

        return null;
    }

    public findParentByName(node: XmlNode, nodeName: string): XmlNode {
        return xml.query.findParent(node, n => n.nodeName === nodeName);
    }

    public findChild(node: XmlNode, predicate: (node: XmlNode) => boolean): XmlNode {
        if (!node)
            return null;
        return (node.childNodes || []).find(child => predicate(child));
    }

    public findChildByName(node: XmlNode, childName: string): XmlNode {
        return xml.query.findChild(node, n => n.nodeName === childName);
    }

    /**
     * Returns all siblings between 'firstNode' and 'lastNode' inclusive.
     */
    public siblingsInRange(firstNode: XmlNode, lastNode: XmlNode): XmlNode[] {
        if (!firstNode)
            throw new InternalArgumentMissingError(nameof(firstNode));
        if (!lastNode)
            throw new InternalArgumentMissingError(nameof(lastNode));

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
    }

    public descendants(node: XmlNode, maxDepth: number, predicate: XmlNodePredicate): XmlNode[] {
        const result: XmlNode[] = [];
        const it = new XmlTreeIterator(node, maxDepth);
        while (it.node) {
            if (predicate(it.node)) {
                result.push(it.node);
            }
            it.next();
        }
        return result;
    }
}

class Modify {

    /**
     * Insert the node as a new sibling, before the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    public insertBefore(newNode: XmlNode, referenceNode: XmlNode): void {
        if (!newNode)
            throw new InternalArgumentMissingError(nameof(newNode));
        if (!referenceNode)
            throw new InternalArgumentMissingError(nameof(referenceNode));

        if (!referenceNode.parentNode)
            throw new Error(`'${nameof(referenceNode)}' has no parent`);

        const childNodes = referenceNode.parentNode.childNodes;
        const beforeNodeIndex = childNodes.indexOf(referenceNode);
        xml.modify.insertChild(referenceNode.parentNode, newNode, beforeNodeIndex);
    }

    /**
     * Insert the node as a new sibling, after the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    public insertAfter(newNode: XmlNode, referenceNode: XmlNode): void {
        if (!newNode)
            throw new InternalArgumentMissingError(nameof(newNode));
        if (!referenceNode)
            throw new InternalArgumentMissingError(nameof(referenceNode));

        if (!referenceNode.parentNode)
            throw new Error(`'${nameof(referenceNode)}' has no parent`);

        const childNodes = referenceNode.parentNode.childNodes;
        const referenceNodeIndex = childNodes.indexOf(referenceNode);
        xml.modify.insertChild(referenceNode.parentNode, newNode, referenceNodeIndex + 1);
    }

    public insertChild(parent: XmlNode, child: XmlNode, childIndex: number): void {
        if (!parent)
            throw new InternalArgumentMissingError(nameof(parent));
        if (xml.query.isTextNode(parent))
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new InternalArgumentMissingError(nameof(child));

        if (!parent.childNodes)
            parent.childNodes = [];

        // revert to append
        if (childIndex === parent.childNodes.length) {
            xml.modify.appendChild(parent, child);
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
    }

    public appendChild(parent: XmlNode, child: XmlNode): void {
        if (!parent)
            throw new InternalArgumentMissingError(nameof(parent));
        if (xml.query.isTextNode(parent))
            throw new Error('Appending children to text nodes is forbidden');
        if (!child)
            throw new InternalArgumentMissingError(nameof(child));

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

    /**
     * Removes the node from it's parent.
     *
     * * **Note**: It is more efficient to call removeChild(parent, childIndex).
     */
    public remove(node: XmlNode): void {
        if (!node)
            throw new InternalArgumentMissingError(nameof(node));

        if (!node.parentNode)
            throw new Error('Node has no parent');

        xml.modify.removeChild(node.parentNode, node);
    }

    /**
     * Remove a child node from it's parent. Returns the removed child.
     *
     * * **Note:** Prefer calling with explicit index.
     */
    public removeChild(parent: XmlNode, child: XmlNode): XmlNode;
    /**
     * Remove a child node from it's parent. Returns the removed child.
     */
    public removeChild(parent: XmlNode, childIndex: number): XmlNode;
    public removeChild(parent: XmlNode, childOrIndex: XmlNode | number): XmlNode {
        if (!parent)
            throw new InternalArgumentMissingError(nameof(parent));
        if (childOrIndex === null || childOrIndex === undefined)
            throw new InternalArgumentMissingError(nameof(childOrIndex));

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

    public removeChildren(parent: XmlNode, predicate: (child: XmlNode) => boolean): void {
        while (parent.childNodes?.length) {
            const index = parent.childNodes.findIndex(predicate);
            if (index === -1) {
                break;
            }
            xml.modify.removeChild(parent, index);
        }
    }

    /**
     * Remove sibling nodes between 'from' and 'to' excluding both.
     * Return the removed nodes.
     */
    public removeSiblings(from: XmlNode, to: XmlNode): XmlNode[] {
        if (from === to)
            return [];

        const removed: XmlNode[] = [];
        let lastRemoved: XmlNode;
        from = from.nextSibling;
        while (from !== to) {
            const removeMe = from;
            from = from.nextSibling;

            xml.modify.remove(removeMe);
            removed.push(removeMe);

            if (lastRemoved)
                lastRemoved.nextSibling = removeMe;
            lastRemoved = removeMe;
        }

        return removed;
    }

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
    public splitByChild(parent: XmlNode, child: XmlNode, removeChild: boolean): [XmlNode, XmlNode] {

        if (child.parentNode != parent)
            throw new Error(`Node '${nameof(child)}' is not a direct child of '${nameof(parent)}'.`);

        // create childless clone 'left'
        const left = xml.create.cloneNode(parent, false);
        if (parent.parentNode) {
            xml.modify.insertBefore(left, parent);
        }
        const right = parent;

        // move nodes from 'right' to 'left'
        let curChild = right.childNodes[0];
        while (curChild != child) {
            xml.modify.remove(curChild);
            xml.modify.appendChild(left, curChild);
            curChild = right.childNodes[0];
        }

        // remove child
        if (removeChild) {
            xml.modify.removeChild(right, 0);
        }

        return [left, right];
    }

    /**
     * Recursively removes text nodes leaving only "general nodes".
     */
    public removeEmptyTextNodes(node: XmlNode): void {
        recursiveRemoveEmptyTextNodes(node);
    }
}

//
// private functions
//

function cloneNodeDeep<T extends XmlNode>(original: T): T {

    const clone: XmlNode = ({} as any);

    // basic properties
    clone.nodeType = original.nodeType;
    clone.nodeName = original.nodeName;
    if (xml.query.isTextNode(original)) {
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
        if (xml.query.isTextNode(child)) {

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

export const xml = new XmlUtils();
