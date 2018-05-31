import { platform } from './utils';

// tslint:disable:variable-name

//
// platform specific modules
//

let xmlServices: any;
if (platform.isNode) {
    xmlServices = require("xmldom");
} else {
    xmlServices = window;
}
const DomParserType: typeof DOMParser = xmlServices.DOMParser;
const XmlSerializerType: typeof XMLSerializer = xmlServices.XMLSerializer;

//
// parser class
//

export class XmlParser {

    private static readonly parser = new DomParserType();
    private static readonly serializer = new XmlSerializerType();

    public parse(str: string): Document {
        return XmlParser.parser.parseFromString(str, "text/xml");
    }

    public serialize(xmlNode: Node): string {
        return XmlParser.serializer.serializeToString(xmlNode).replace(/xmlns:[a-z0-9]+="" ?/g, "");
    }    
}
