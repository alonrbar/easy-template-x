
//
// core
//

export declare class TemplateHandler {
    
    constructor(options?: TemplateHandlerOptions);
    
    process<T extends Binary>(templateFile: T, data: any): Promise<T>;
    
    getText(docxFile: Binary): Promise<string>;
}

export declare class TemplateHandlerOptions {

    plugins?: TemplatePlugin[];

    delimiters?: Delimiters;

    maxXmlDepth?: number;

    constructor(initial?: Partial<TemplateHandlerOptions>);
}

export declare class Delimiters {

    start: string;

    end: string;

    constructor(initial?: Delimiters);
}

export declare type Binary = Blob | Buffer | ArrayBuffer;

//
// xml
//

export declare class XmlParser {

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

// tslint:disable-next-line:no-namespace
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
    export function splitByChild(root: XmlNode, markerNode: XmlNode, removeMarkerNode: boolean): [ XmlNode, XmlNode ];
}

//
// compilation
//

export declare class TemplateCompiler {

    constructor(delimiterSearcher: DelimiterSearcher, tagParser: TagParser, plugins: TemplatePlugin[]);

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    compile(node: XmlNode, data: ScopeData, context: TemplateContext): void;
}

export declare class DelimiterMark {
    
    xmlTextNode: XmlTextNode;
    
    /**
     * Index inside the text node
     */
    index: number;
    
    /**
     * Is this an open delimiter or a close delimiter
     */
    isOpen: boolean;

    constructor(initial?: Partial<DelimiterMark>);
}

export declare class DelimiterSearcher {
    
    maxXmlDepth: number;
    
    startDelimiter: string;
    
    endDelimiter: string;
    
    findDelimiters(node: XmlNode): DelimiterMark[];
}

export declare class TagParser {
    
    startDelimiter: string;
    
    endDelimiter: string;
    
    constructor(tagPrefixes: TagPrefix[], docParser: DocxParser);
    
    parse(delimiters: DelimiterMark[]): Tag[];
}

export declare class ScopeData {
    
    path: (string | number)[];
    
    readonly allData: any;
    
    constructor(data: any);
    
    getScopeData(): any;
}

export interface TemplateContext {
    
    zipFile: JSZip;
    
    currentFilePath: string;
}

export declare class DocxParser {

    static readonly PARAGRAPH_NODE: string;
    
    static readonly RUN_NODE: string;
    
    static readonly TEXT_NODE: string;
    
    contentFilePaths(zip: JSZip): string[];
    
    mainFilePath(zip: JSZip): string;
    
    /**
     * Split the text node into two text nodes, each with it's own wrapping <w:t> node.
     * Returns the newly created text node.
     *
     * @param addBefore Should the new node be added before or after the original node.
     */
    splitTextNode(textNode: XmlTextNode, splitIndex: number, addBefore: boolean): XmlTextNode;
    
    /**
     * Move all text between the 'from' and 'to' nodes to the 'from' node.
     */
    joinTextNodesRange(from: XmlTextNode, to: XmlTextNode): void;
    
    /**
     * Take all runs from 'second' and move them to 'first'.
     */
    joinParagraphs(first: XmlNode, second: XmlNode): void;
    
    /**
     * Search for the first child **Word** text node (i.e. a <w:t> node).
     */
    firstTextNodeChild(node: XmlNode): XmlNode;
    
    /**
     * Search **upwards** for the first **Word** text node (i.e. a <w:t> node).
     */
    containingTextNode(node: XmlTextNode): XmlNode;
    
    /**
     * Search **upwards** for the first run node.
     */
    containingRunNode(node: XmlNode): XmlNode;
    
    /**
     * Search **upwards** for the first paragraph node.
     */
    containingParagraphNode(node: XmlNode): XmlNode;
}

//
// tags
//

export declare enum TagDisposition {
    Open = "Open",
    Close = "Close",
    SelfClosed = "SelfClosed",
}

export declare class Tag {
    
    name: string;
    
    type: string;
    
    rawText: string;
    
    disposition: TagDisposition;
    
    xmlTextNode: XmlTextNode;

    constructor(initial?: Partial<Tag>);
}

export interface TagPrefix {

    prefix: string;
    
    tagType: string;
    
    tagDisposition: TagDisposition;
}

//
// plugins
//

export interface PluginUtilities {

    compiler: TemplateCompiler;

    docxParser: DocxParser;

    xmlParser: XmlParser;
}

export declare abstract class TemplatePlugin {

    readonly abstract prefixes: TagPrefix[];

    protected utilities: PluginUtilities;

    /**
     * Called by the TemplateHandler at runtime.
     */
    setUtilities(utilities: PluginUtilities): void;
    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     */
    simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): void;
    /**
     * This method is called for each container tag. It should implement the
     * specific document manipulation required by the tag.
     *
     * @param tags All tags between the opening tag and closing tag (inclusive,
     * i.e. tags[0] is the opening tag and the last item in the tags array is
     * the closing tag).
     */
    containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void;
}

export declare class TextPlugin extends TemplatePlugin {
}

export declare class LoopPlugin extends TemplatePlugin {
}

export declare class RawXmlPlugin extends TemplatePlugin {
}

//
// errors
//

export declare class MaxXmlDepthError extends Error {
    readonly maxDepth: number;
    constructor(maxDepth: number);
}

export declare class MissingArgumentError extends Error {
    constructor(argName: string);
}

export declare class MissingStartDelimiterError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export declare class MissingCloseDelimiterError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export declare class UnknownPrefixError extends Error {
    readonly tagRawText: string;
    constructor(tagRawText: string);
}

export declare class UnopenedTagError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export declare class UnclosedTagError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export declare class UnidentifiedFileTypeError extends Error {
    constructor();
}

export declare class UnsupportedFileTypeError extends Error {
    constructor(fileType: string);
}



