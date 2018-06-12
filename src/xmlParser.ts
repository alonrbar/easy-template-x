import { MissingArgumentError } from './errors';
import { XmlNode } from './xmlNode';

// always use DOMParser from 'xmldom' since
// it handles xml namespaces better
const DomParserType = require("xmldom").DOMParser;  // tslint:disable-line:variable-name

export class XmlParser {

    private static xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    private static readonly parser: DOMParser = new DomParserType();

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
