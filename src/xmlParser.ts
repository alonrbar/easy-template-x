import { MaxXmlDepthError, MissingArgumentError } from './errors';
import { MAX_XML_DEPTH, platform } from './utils';

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

    /**
     * Encode string to make it safe to use inside xml tags.
     * 
     * https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
     */
    public static encode(str: string): string {
        if (str === null || str === undefined)
            throw new MissingArgumentError(nameof(str));

        return str.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
            return '';
        });
    }

    public parse(str: string): Document {
        return XmlParser.parser.parseFromString(str, "text/xml");
    }

    public serialize(xmlNode: Node): string {
        return XmlParser.serializer.serializeToString(xmlNode);
    }

    public textContent(node: Node): string {
        return this.textContentRecurse(node, 0);
    }

    //
    // private methods
    //

    private textContentRecurse(node: Node, depth: number): string {
        if (depth > MAX_XML_DEPTH)
            throw new MaxXmlDepthError(depth);

        if (!node)
            return '';

        if (node.nodeType === node.TEXT_NODE)
            return node.textContent;

        // process child nodes
        const childrenText: string[] = [];
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            const child = node.childNodes.item(i);
            const childText = this.textContentRecurse(child, depth + 1);
            childrenText.push(childText);
        }

        return childrenText.join('');
    }
}
