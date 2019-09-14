
//
// core
//

export class TemplateHandler {

    constructor(options?: TemplateHandlerOptions);

    process<T extends Binary>(templateFile: T, data: any): Promise<T>;

    parseTags(templateFile: Binary): Promise<Tag[]>;

    /**
     * Get the text content of the main document file.
     */
    getText(docxFile: Binary): Promise<string>;

    /**
     * Get the xml tree of the main document file.
     */
    getXml(docxFile: Binary): Promise<XmlNode>;
}

export type TemplateContent = string | number | boolean | ImageContent | RawXmlContent;

export interface TemplateData {
    [tagName: string]: TemplateContent | TemplateData | TemplateData[];
}

export class TemplateHandlerOptions {

    plugins?: TemplatePlugin[];

    defaultContentType = TEXT_CONTENT_TYPE;

    containerContentType = LOOP_CONTENT_TYPE;

    delimiters?: Delimiters;

    maxXmlDepth?= 20;

    constructor(initial?: Partial<TemplateHandlerOptions>);
}

export class Delimiters {

    start: string;

    end: string;

    constructor(initial?: Delimiters);
}

export type Binary = Blob | Buffer | ArrayBuffer;

//
// xml
//

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

//
// compilation
//

export class TemplateCompiler {

    constructor(
        delimiterSearcher: DelimiterSearcher,
        tagParser: TagParser,
        plugins: TemplatePlugin[],
        defaultContentType: string,
        containerContentType: string
    );

    /**
     * Compiles the template and performs the required replacements using the
     * specified data.
     */
    compile(node: XmlNode, data: ScopeData, context: TemplateContext): Promise<void>;

    parseTags(node: XmlNode): Tag[];
}

export class DelimiterMark {

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

export class DelimiterSearcher {

    maxXmlDepth = 20;
    startDelimiter = "{";
    endDelimiter = "}";

    findDelimiters(node: XmlNode): DelimiterMark[];
}

export class TagParser {

    constructor(docParser: DocxParser, delimiters: Delimiters);

    parse(delimiters: DelimiterMark[]): Tag[];
}

export class ScopeData {

    readonly path: (string | number)[] = [];
    readonly allData: TemplateData;

    constructor(data: TemplateData);

    getScopeData(): TemplateContent | TemplateData[];
}

export interface TemplateContext {

    docx: Docx;
}

//
// office
//

export class DocxParser {

    static readonly PARAGRAPH_NODE = 'w:p';
    static readonly PARAGRAPH_PROPERTIES_NODE = 'w:pPr';
    static readonly RUN_NODE = 'w:r';
    static readonly TEXT_NODE = 'w:t';
    static readonly TABLE_ROW_NODE = 'w:tr';
    static readonly TABLE_CELL_NODE = 'w:tc';
    static readonly NUMBER_PROPERTIES_NODE = 'w:numPr';

    constructor(xmlParser: XmlParser);

    //
    // parse document
    //

    load(zip: Zip): Docx;

    //
    // content manipulation
    //

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

    //
    // node queries
    //

    isTableCellNode(node: XmlNode): boolean;

    isParagraphNode(node: XmlNode): boolean;

    isListParagraph(paragraphNode: XmlNode): boolean;

    paragraphPropertiesNode(paragraphNode: XmlNode): XmlNode;

    /**
     * Search for the first direct child **Word** text node (i.e. a <w:t> node).
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

    /**
     * Search **upwards** for the first "table row" node.
     */
    containingTableRowNode(node: XmlNode): XmlNode;
}

/**
 * Represents a single docx file.
 */
export class Docx {

    readonly documentPath: string;

    /**
     * The xml root of the main document file.
     */
    getDocument(): Promise<XmlNode>;

    /**
     * Get the text content of the main document file.
     */
    getDocumentText(): Promise<string>;

    /**
     * Add a media resource to the document archive and return the created rel ID.
     */
    addMedia(content: Binary, type: MimeType): Promise<string>;

    export<T extends Binary>(outputType: Constructor<T>): Promise<T>;
}

//
// tags
//

export enum TagDisposition {
    Open = "Open",
    Close = "Close",
    SelfClosed = "SelfClosed",
}

export interface Tag {    
    name: string;
    /**
     * The full tag text, for instance: "{#my-tag}".
     */
    rawText: string;
    disposition: TagDisposition;
    xmlTextNode: XmlTextNode;
}

//
// plugins
//

export interface PluginUtilities {

    compiler: TemplateCompiler;

    docxParser: DocxParser;

    xmlParser: XmlParser;
}

/* eslint-disable @typescript-eslint/member-ordering */

export abstract class TemplatePlugin {

    /**
     * The content type this plugin handles.
     */
    abstract get contentType(): string;

    /**
     * Called by the TemplateHandler at runtime.
     */
    setUtilities(utilities: PluginUtilities): void;
    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     */
    simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): void | Promise<void>;
    /**
     * This method is called for each container tag. It should implement the
     * specific document manipulation required by the tag.
     *
     * @param tags All tags between the opening tag and closing tag (inclusive,
     * i.e. tags[0] is the opening tag and the last item in the tags array is
     * the closing tag).
     */
    containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void | Promise<void>;
}

/* eslint-enable */

export interface PluginContent {
    _type: string;
}

export const TEXT_CONTENT_TYPE = 'text';

export class TextPlugin extends TemplatePlugin {
    readonly contentType = TEXT_CONTENT_TYPE;
}

export const LOOP_CONTENT_TYPE = 'loop';

export class LoopPlugin extends TemplatePlugin {
    readonly contentType = LOOP_CONTENT_TYPE;
}

export interface RawXmlContent extends PluginContent {
    _type: 'rawXml';
    xml: string;
}

export class RawXmlPlugin extends TemplatePlugin {
    readonly contentType = 'rawXml';
}

export type ImageFormat = MimeType.Jpeg | MimeType.Png | MimeType.Gif | MimeType.Bmp | MimeType.Svg;

export interface ImageContent extends PluginContent {
    _type: 'image';
    source: Binary;
    format: ImageFormat;
    width: number;
    height: number;
}

export class ImagePlugin extends TemplatePlugin {
    readonly contentType = 'image';
}

//
// errors
//

export class MalformedFileError extends Error {
    readonly expectedFileType: string;
    constructor(expectedFileType: string);
}

export class MaxXmlDepthError extends Error {
    readonly maxDepth: number;
    constructor(maxDepth: number);
}

export class MissingArgumentError extends Error {
    argName: string;
    constructor(argName: string);
}

export class MissingStartDelimiterError extends Error {
    readonly closeDelimiterText: string;
    constructor(closeDelimiterText: string);
}

export class MissingCloseDelimiterError extends Error {
    readonly openDelimiterText: string;
    constructor(openDelimiterText: string);
}

export class UnknownContentTypeError extends Error {
    readonly tagRawText: string;
    readonly contentType: string;
    readonly path: string;
    constructor(contentType: string, tagRawText: string, path: string);
}

export class UnopenedTagError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export class UnclosedTagError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export class UnidentifiedFileTypeError extends Error {
    constructor();
}

export class UnsupportedFileTypeError extends Error {
    constructor(fileType: string);
}

//
// misc
//

export enum MimeType {
    Png = 'image/png',
    Jpeg = 'image/jpeg',
    Gif = 'image/gif',
    Bmp = 'image/bmp',
    Svg = 'image/svg+xml'
}