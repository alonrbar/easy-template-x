import * as fs from 'fs';
import { loremIpsum } from 'lorem-ipsum';
import { XmlNode, XmlParser } from '../src/xml';

const xmlParser = new XmlParser();

export function removeWhiteSpace(text: string): string {
    return _removeWhiteSpace(text);
}

export function parseXml(xml: string, removeWhiteSpace = true): XmlNode {
    if (removeWhiteSpace)
        xml = _removeWhiteSpace(xml);
    return xmlParser.parse(xml);
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
