export class XmlParser {

    parse(str: string): XmlNode;

    domParse(str: string): Document;

    serialize(xmlNode: XmlNode): string;
}

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

export const TEXT_NODE_NAME_VALUE = '#text'; // see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName

export interface XmlTextNode extends XmlNodeBase {

    nodeType: XmlNodeType.Text;

    nodeName: typeof TEXT_NODE_NAME_VALUE;

    textContent: string;
}

export interface XmlGeneralNode extends XmlNodeBase {

    nodeType: XmlNodeType.General;

    attributes?: XmlAttribute[];
}

export interface XmlAttribute {
    name: string;
    value: string;
}

export namespace XmlNode {

    //
    // constants
    //

    export const TEXT_NODE_NAME = TEXT_NODE_NAME_VALUE;

    //
    // factories
    //

    export function createTextNode(text?: string): XmlTextNode;

    export function createGeneralNode(name: string): XmlGeneralNode;

    //
    // serialization
    //

    /**
     * Encode string to make it safe to use inside xml tags.
     */
    export function encodeValue(str: string): string;

    export function serialize(node: XmlNode): string;

    /**
     * The conversion is always deep.
     */
    export function fromDomNode(domNode: Node): XmlNode;

    //
    // core functions
    //

    export function isTextNode(node: XmlNode): node is XmlTextNode;

    export function cloneNode(node: XmlNode, deep: boolean): XmlNode;

    /**
     * Insert the node as a new sibling, before the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    export function insertBefore(newNode: XmlNode, referenceNode: XmlNode): void;

    /**
     * Insert the node as a new sibling, after the original node.
     *
     * * **Note**: It is more efficient to use the insertChild function if you
     *   already know the relevant index.
     */
    export function insertAfter(newNode: XmlNode, referenceNode: XmlNode): void;

    export function insertChild(parent: XmlNode, child: XmlNode, childIndex: number): void;

    export function appendChild(parent: XmlNode, child: XmlNode): void;

    /**
     * Removes the node from it's parent.
     * 
     * * **Note**: It is more efficient to call removeChild(parent, childIndex).
     */
    export function remove(node: XmlNode): void;

    /**
     * Remove a child node from it's parent. Returns the removed child.
     * 
     * * **Note:** Prefer calling with explicit index.
     */
    export function removeChild(parent: XmlNode, child: XmlNode): XmlNode;

    /**
     * Remove a child node from it's parent. Returns the removed child.
     */
    export function removeChild(parent: XmlNode, childIndex: number): XmlNode;

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
    export function lastTextChild(node: XmlNode): XmlTextNode;

    /**
     * Remove sibling nodes between 'from' and 'to' excluding both.
     * Return the removed nodes.
     */
    export function removeSiblings(from: XmlNode, to: XmlNode): XmlNode[];

    /**
     * Split the original node into two sibling nodes.
     * Returns both nodes.
     *
     * @param root The node to split
     * @param markerNode The node that marks the split position.      
     */
    export function splitByChild(root: XmlNode, markerNode: XmlNode, removeMarkerNode: boolean): [XmlNode, XmlNode];

    export function findParent(node: XmlNode, predicate: (node: XmlNode) => boolean): XmlNode;

    export function findParentByName(node: XmlNode, nodeName: string): XmlNode;

    export function findChildByName(node: XmlNode, childName: string): XmlNode;

    export function siblingsInRange(firstNode: XmlNode, lastNode: XmlNode): XmlNode[];

    /**
     * Recursively removes text nodes leaving only "general nodes".
     */
    export function stripTextNodes(node: XmlGeneralNode): void;
}