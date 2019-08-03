import { XmlNode, XmlParser } from 'src/xml';

const lorem = require('lorem-ipsum');

const xmlParser = new XmlParser();

export function parseXml(xml: string, removeWhiteSpace = true): XmlNode {
    if (removeWhiteSpace)
        xml = xml.replace(/\s/g, '');
    return xmlParser.parse(xml);
}

export function randomWords(count = 1): string {
    return lorem({ count, units: 'words' });
}

export function randomParagraphs(count = 1): string {
    return lorem({ count, units: 'paragraphs' });
}