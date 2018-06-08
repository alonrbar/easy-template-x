import { MissingArgumentError } from './errors';
import { platform } from './utils';
import { XmlNode } from './xmlNode';

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

//
// parser class
//

export class XmlParser {

    private static xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    private static readonly parser = new DomParserType();

    public parse(str: string): XmlNode {
        const doc = this.domParse(str);
        return XmlNode.fromDomNode(doc.documentElement);
    }

    public domParse(str: string): Document {
        if (str === null || str === undefined)
            throw new MissingArgumentError(nameof(str));

        return XmlParser.parser.parseFromString(str, "text/xml");
    }

    public serialize(xmlNode: XmlNode): string {
        return XmlParser.xmlHeader + XmlNode.serialize(xmlNode);
    }    
}
