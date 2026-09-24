import { XmlParseError } from "src/errors";
import { COMMENT_NODE_NAME, TEXT_NODE_NAME, XmlCommentNode, XmlGeneralNode, XmlNode, XmlNodeType, XmlTextNode } from "./xmlNode";

const Char = Object.freeze({
    Tab: 0x09,
    LineFeed: 0x0a,
    CarriageReturn: 0x0d,
    Space: 0x20,
    Bang: 0x21,
    Quote: 0x22,
    Hash: 0x23,
    Amp: 0x26,
    Apos: 0x27,
    Slash: 0x2f,
    Semicolon: 0x3b,
    LessThan: 0x3c,
    Equals: 0x3d,
    GreaterThan: 0x3e,
    Question: 0x3f,
    LowerX: 0x78,
    Bom: 0xfeff,
} as const);

/**
 * Longest entity we try to decode (e.g. `&#x10FFFF;`). Bounds the scan for the
 * terminating semicolon.
 */
const maxEntityLength = 16;

/**
 * A minimal, non-validating XML parser that produces an `XmlNode` tree.
 *
 * Supports the subset of XML used by Office Open XML documents: elements,
 * attributes, text (with entity decoding), comments and CDATA sections. The
 * XML declaration, processing instructions and the DOCTYPE declaration are
 * skipped.
 *
 * DTDs are intentionally not supported. As a result, entity expansion attacks
 * ("billion laughs") and external entity injection (XXE) are impossible by
 * construction. Namespaces are not resolved - prefixed names are treated as
 * opaque strings.
 *
 * The implementation avoids recursion (explicit stack) and regular expressions
 * so that pathological inputs cannot cause stack overflows or catastrophic
 * backtracking.
 */
export class XmlParser {

    public static parse(str: string): XmlGeneralNode {
        return new XmlParser(str).parse();
    }

    private readonly str: string;
    private readonly stack: XmlGeneralNode[] = [];
    private pos = 0;
    private root: XmlGeneralNode = null;

    private constructor(str: string) {
        this.str = str;
    }

    private parse(): XmlGeneralNode {
        const str = this.str;
        const len = str.length;

        // Skip BOM
        if (len && str.charCodeAt(0) === Char.Bom) {
            this.pos = 1;
        }

        // Loop over the string, always moving forward
        while (this.pos < len) {

            // Find the next xml markup
            const openIndex = str.indexOf('<', this.pos);

            // No more markup - the rest is text
            if (openIndex === -1) {
                const text = str.slice(this.pos);
                this.handleText(text, false);
                this.pos = len;
                break;
            }

            // Mid text node
            if (this.pos < openIndex) {
                const text = str.slice(this.pos, openIndex);
                this.handleText(text, false);
                this.pos = openIndex;
            }

            // Element closing
            const next = str.charCodeAt(openIndex + 1);
            if (next === Char.Slash) {
                this.parseElementClose();
                continue;
            }

            // Non-element markup
            if (next === Char.Question) {
                this.parseProcessingInstruction();
                continue;
            }
            if (next === Char.Bang) {

                if (str.startsWith('<!--', openIndex)) {
                    this.parseComment();
                    continue;
                }

                if (str.startsWith('<![CDATA[', openIndex)) {
                    this.parseCData();
                    continue;
                }

                if (str.startsWith('<!DOCTYPE', openIndex)) {
                    this.parseDocType();
                    continue;
                }

                throw this.error('Unexpected markup.');
            }

            // Element opening
            this.parseElementOpen();
        }

        if (this.stack.length) {
            throw this.error(`Unclosed element <${this.stack[this.stack.length - 1].nodeName}>.`);
        }
        if (!this.root) {
            throw this.error('No root element found.');
        }

        return this.root;
    }

    //
    // Markup handlers
    //

    private parseElementOpen(): void {
        const str = this.str;
        const len = str.length;
        this.pos++; // '<'

        const nodeName = this.readName();
        if (!nodeName) {
            throw this.error('Invalid element name.');
        }

        const node: XmlGeneralNode = {
            nodeType: XmlNodeType.General,
            nodeName,
            attributes: {},
            childNodes: [],
        };

        // Attributes
        for (; ;) {
            this.skipWhitespace();
            if (this.pos >= len) {
                throw this.error(`Unterminated element <${nodeName}>.`);
            }

            const c = str.charCodeAt(this.pos);

            // End of element opening
            if (c === Char.GreaterThan) {
                this.pos++;
                this.appendChild(node);
                this.stack.push(node);
                return;
            }

            // Self-closing element
            if (c === Char.Slash) {
                if (str.charCodeAt(this.pos + 1) !== Char.GreaterThan) {
                    throw this.error(`Unexpected '/' in element <${nodeName}>.`);
                }
                this.pos += 2;
                this.appendChild(node);
                return;
            }

            // Attribute
            const attrName = this.readName();
            if (!attrName) {
                throw this.error(`Invalid attribute name in element <${nodeName}>.`);
            }
            if (attrName === '__proto__') {
                throw this.error(`Forbidden attribute name '${attrName}'.`);
            }
            this.skipWhitespace();
            if (str.charCodeAt(this.pos) !== Char.Equals) {
                throw this.error(`Attribute '${attrName}' has no value.`);
            }
            this.pos++;
            this.skipWhitespace();
            const quote = str.charCodeAt(this.pos);
            if (quote !== Char.Quote && quote !== Char.Apos) {
                throw this.error(`Attribute '${attrName}' value must be quoted.`);
            }
            const valueStart = this.pos + 1;
            const valueEnd = str.indexOf(String.fromCharCode(quote), valueStart);
            if (valueEnd === -1) {
                throw this.error(`Unterminated value of attribute '${attrName}'.`);
            }
            node.attributes[attrName] = decodeEntities(normalizeAttributeWhitespace(str.slice(valueStart, valueEnd)));
            this.pos = valueEnd + 1;
        }
    }

    private parseElementClose(): void {
        const str = this.str;
        const start = this.pos;
        this.pos += 2; // '</'

        const nodeName = this.readName();
        this.skipWhitespace();

        // Errors are reported at the start of the closing tag.
        if (str.charCodeAt(this.pos) !== Char.GreaterThan) {
            this.pos = start;
            throw this.error(`Malformed element closing </${nodeName}>.`);
        }
        if (!this.stack.length) {
            this.pos = start;
            throw this.error(`Unexpected element closing </${nodeName}>.`);
        }
        const open = this.stack[this.stack.length - 1];
        if (open.nodeName !== nodeName) {
            this.pos = start;
            throw this.error(`Element closing </${nodeName}> does not match element opening <${open.nodeName}>.`);
        }

        this.pos++; // '>'
        this.stack.pop();
    }

    private parseComment(): void {
        const contentStart = this.pos + 4; // '<!--'
        const end = this.str.indexOf('-->', contentStart);
        if (end === -1) {
            throw this.error('Unterminated comment.');
        }

        // Comments outside of the root element are dropped.
        if (this.stack.length) {
            const node: XmlCommentNode = {
                nodeType: XmlNodeType.Comment,
                nodeName: COMMENT_NODE_NAME,
                commentContent: normalizeLineEndings(this.str.slice(contentStart, end)).trim(),
            };
            this.appendChild(node);
        }

        this.pos = end + 3;
    }

    private parseCData(): void {
        const contentStart = this.pos + 9; // '<![CDATA['
        const end = this.str.indexOf(']]>', contentStart);
        if (end === -1) {
            throw this.error('Unterminated CDATA section.');
        }
        const text = this.str.slice(contentStart, end);
        this.handleText(text, true);
        this.pos = end + 3;
    }

    private parseProcessingInstruction(): void {
        const end = this.str.indexOf('?>', this.pos + 2);
        if (end === -1) {
            throw this.error('Unterminated processing instruction.');
        }
        this.pos = end + 2;
    }

    private parseDocType(): void {
        const str = this.str;
        let end = str.indexOf('>', this.pos);

        // Skip the internal subset, if any (we do not process DTDs).
        const subsetStart = str.indexOf('[', this.pos);
        if (subsetStart !== -1 && subsetStart < end) {
            const subsetEnd = str.indexOf(']', subsetStart);
            end = subsetEnd === -1 ? -1 : str.indexOf('>', subsetEnd);
        }

        if (end === -1) {
            throw this.error('Unterminated DOCTYPE declaration.');
        }
        this.pos = end + 1;
    }

    private handleText(text: string, isCData: boolean): void {

        // Text outside of the root element
        if (!this.stack.length) {
            if (isCData || !isWhitespace(text)) {
                throw this.error('Text found outside of the root element.');
            }
            return;
        }

        text = normalizeLineEndings(text);
        const textContent = isCData ? text : decodeEntities(text);

        // Merge with the previous text node (relevant for CDATA sections).
        const parent = this.stack[this.stack.length - 1];
        const lastChild = parent.childNodes[parent.childNodes.length - 1];
        if (lastChild && lastChild.nodeType === XmlNodeType.Text) {
            lastChild.textContent += textContent;
            return;
        }

        const node: XmlTextNode = {
            nodeType: XmlNodeType.Text,
            nodeName: TEXT_NODE_NAME,
            textContent,
        };
        this.appendChild(node);
    }

    //
    // Helpers
    //

    private appendChild(node: XmlNode): void {
        if (!this.stack.length) {
            if (this.root) {
                throw this.error('Multiple root elements found.');
            }
            this.root = node as XmlGeneralNode;
            return;
        }

        const parent = this.stack[this.stack.length - 1];
        const prevSibling = parent.childNodes[parent.childNodes.length - 1];
        if (prevSibling) {
            prevSibling.nextSibling = node;
        }
        node.parentNode = parent;
        parent.childNodes.push(node);
    }

    private readName(): string {
        const str = this.str;
        const len = str.length;
        const start = this.pos;
        while (this.pos < len && isNameChar(str.charCodeAt(this.pos))) {
            this.pos++;
        }
        return str.slice(start, this.pos);
    }

    private skipWhitespace(): void {
        const str = this.str;
        const len = str.length;
        while (this.pos < len && isWhitespaceChar(str.charCodeAt(this.pos))) {
            this.pos++;
        }
    }

    private error(message: string): XmlParseError {
        const pos = Math.min(this.pos, this.str.length);

        // Count line breaks up to the error position. Both "\r\n" and a lone
        // "\r" count as a single line break.
        let line = 1;
        let lineStart = 0;
        for (let i = 0; i < pos; i++) {
            const c = this.str.charCodeAt(i);
            if (c === Char.LineFeed || (c === Char.CarriageReturn && this.str.charCodeAt(i + 1) !== Char.LineFeed)) {
                line++;
                lineStart = i + 1;
            }
        }
        const column = pos - lineStart + 1;

        return new XmlParseError(message, pos, line, column);
    }
}

function isWhitespaceChar(c: number): boolean {
    return c === Char.Space || c === Char.LineFeed || c === Char.CarriageReturn || c === Char.Tab;
}

function isWhitespace(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
        if (!isWhitespaceChar(text.charCodeAt(i))) {
            return false;
        }
    }
    return true;
}

function isNameChar(c: number): boolean {
    return !isWhitespaceChar(c) &&
        c !== Char.LessThan &&
        c !== Char.GreaterThan &&
        c !== Char.Slash &&
        c !== Char.Equals &&
        c !== Char.Quote &&
        c !== Char.Apos;
}

/**
 * Normalize line endings as required by the XML spec: "\r\n" and a lone "\r"
 * are both converted to "\n".
 */
function normalizeLineEndings(str: string): string {
    let cr = str.indexOf('\r');
    if (cr === -1) {
        return str;
    }

    let result = '';
    let pos = 0;
    while (cr !== -1) {
        result += str.slice(pos, cr) + '\n';
        pos = cr + 1;
        if (str.charCodeAt(pos) === Char.LineFeed) {
            pos++;
        }
        cr = str.indexOf('\r', pos);
    }
    return result + str.slice(pos);
}

/**
 * Normalize whitespace in attribute values as required by the XML spec: each
 * "\r\n", "\r", "\n" and "\t" is replaced by a single space.
 */
function normalizeAttributeWhitespace(str: string): string {
    let result = '';
    let pos = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c !== Char.CarriageReturn && c !== Char.LineFeed && c !== Char.Tab) {
            continue;
        }
        result += str.slice(pos, i) + ' ';
        if (c === Char.CarriageReturn && str.charCodeAt(i + 1) === Char.LineFeed) {
            i++;
        }
        pos = i + 1;
    }
    return pos === 0 ? str : result + str.slice(pos);
}

/**
 * Decode the predefined XML entities and numeric character references.
 * Unknown entities and stray ampersands are kept as-is.
 */
function decodeEntities(str: string): string {
    let amp = str.indexOf('&');
    if (amp === -1) {
        return str;
    }

    let result = '';
    let pos = 0;
    while (amp !== -1) {
        result += str.slice(pos, amp);

        const semicolon = findSemicolon(str, amp + 1);
        const decoded = semicolon === -1 ? null : decodeEntity(str.slice(amp + 1, semicolon));
        if (decoded === null) {
            result += '&';
            pos = amp + 1;
        } else {
            result += decoded;
            pos = semicolon + 1;
        }

        amp = str.indexOf('&', pos);
    }

    return result + str.slice(pos);
}

function findSemicolon(str: string, from: number): number {
    const end = Math.min(str.length, from + maxEntityLength);
    for (let i = from; i < end; i++) {
        const c = str.charCodeAt(i);
        if (c === Char.Semicolon) {
            return i;
        }
        if (c === Char.Amp || c === Char.LessThan || isWhitespaceChar(c)) {
            return -1;
        }
    }
    return -1;
}

function decodeEntity(name: string): string {
    switch (name) {
        case 'lt': return '<';
        case 'gt': return '>';
        case 'amp': return '&';
        case 'apos': return "'";
        case 'quot': return '"';
    }

    // Numeric character reference
    if (name.charCodeAt(0) !== Char.Hash) {
        return null;
    }
    const isHex = name.charCodeAt(1) === Char.LowerX;
    const digits = name.slice(isHex ? 2 : 1);
    if (!digits || !isDigits(digits, isHex)) {
        return null;
    }
    const codePoint = parseInt(digits, isHex ? 16 : 10);
    if (!isValidCodePoint(codePoint)) {
        return null;
    }
    return String.fromCodePoint(codePoint);
}

function isDigits(str: string, hex: boolean): boolean {
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        const isDecimal = c >= 0x30 && c <= 0x39;
        const isHexLetter = (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
        if (!isDecimal && !(hex && isHexLetter)) {
            return false;
        }
    }
    return true;
}

function isValidCodePoint(codePoint: number): boolean {
    if (!Number.isInteger(codePoint) || codePoint <= 0 || codePoint > 0x10ffff) {
        return false;
    }
    const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;
    return !isSurrogate;
}
