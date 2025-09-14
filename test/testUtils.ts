import * as fs from "fs";
import { loremIpsum } from "lorem-ipsum";
import { xml, XmlNode, XmlNodeType } from "../src/xml";
import { XmlCommentNode, XmlGeneralNode, XmlTextNode } from "../src/xml/xmlNode";

export type NodeTypeToNode<T extends XmlNodeType> =
    T extends typeof XmlNodeType.Text ? XmlTextNode :
    T extends typeof XmlNodeType.Comment ? XmlCommentNode :
    T extends typeof XmlNodeType.General ? XmlGeneralNode :
    XmlNode;

export function removeWhiteSpace(text: string): string {
    return _removeWhiteSpace(text);
}

export function parseXml(xmlString: string, removeWhiteSpace = true): XmlNode {
    if (removeWhiteSpace)
        xmlString = _removeWhiteSpace(xmlString);
    return xml.parser.parse(xmlString);
}

export function getChildNode<T extends XmlNodeType>(root: XmlNode, nodeType: T, ...index: number[]): NodeTypeToNode<T> {
    let curNode = root;
    for (let i = 0; i < index.length; i++) {
        const curIndex = index[i];
        const curNodeType = (i == index.length - 1) ? nodeType : XmlNodeType.General;
        curNode = curNode.childNodes.filter(c => c.nodeType === curNodeType)[curIndex];
    }
    return curNode as NodeTypeToNode<T>;
}

export function randomWords(count = 1): string {
    return loremIpsum({ count, units: 'words' });
}

export function randomParagraphs(count = 1): string {
    return loremIpsum({ count, units: 'paragraphs' });
}

/**
 * range(1, 3) ==> [ 1, 2, 3 ]
 */
export function range(start: number, end: number): number[] {
    return new Array(end + 1 - start).fill(0).map((d, i) => i + start);
}

export function readResource(filename: string): Buffer {
    return fs.readFileSync("./test/res/" + filename);
}

export function writeTempFile(filename: string, file: Buffer): string {
    const path = '/temp/' + filename;
    fs.writeFileSync(path, file);
    return path;
}

function _removeWhiteSpace(text: string): string {
    return text.replace(/\s/g, '');
}
