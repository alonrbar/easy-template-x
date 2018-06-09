import { XmlNode } from 'src/xmlNode';
import { XmlParser } from 'src/xmlParser';

const xmlParser = new XmlParser();

export function parseXml(xml: string, removeWhiteSpace = true): XmlNode {
    if (removeWhiteSpace)
        xml = xml.replace(/\s/g, '');
    return xmlParser.parse(xml);
}