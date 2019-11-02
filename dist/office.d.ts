import { Binary, Constructor, IMap, MimeType } from './misc';
import { XmlNode, XmlParser, XmlTextNode } from './xml';
import { Zip } from './zip';

export class DocxParser {

    static readonly PARAGRAPH_NODE = 'w:p';
    static readonly PARAGRAPH_PROPERTIES_NODE = 'w:pPr';
    static readonly RUN_NODE = 'w:r';
    static readonly RUN_PROPERTIES_NODE = 'w:rPr';
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
    readonly rels: Rels;
    readonly mediaFiles: MediaFiles;
    readonly contentTypes: ContentTypesFile;

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

/**
 * Handles the relationship logic of a single docx "part".  
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class Rels {

    constructor(partPath: string, zip: Zip, xmlParser: XmlParser);

    /**
     * Returns the rel ID.
     */
    public add(relTarget: string, relType: string, additionalAttributes?: IMap<string>): Promise<string>;
}

/**
 * Handles media files of the main document.
 */
export class MediaFiles {

    constructor(zip: Zip);

    /**
     * Returns the media file path.
     */
    public add(mediaFile: Binary, mime: MimeType): Promise<string>;

    public count(): Promise<number>;
}

/**
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class ContentTypesFile {

    constructor(zip: Zip, xmlParser: XmlParser);

    public ensureContentType(mime: MimeType): Promise<void>;

    public count(): Promise<number>;
}