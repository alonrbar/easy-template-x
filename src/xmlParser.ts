import { MissingArgumentError } from './errors';
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
        if (str === null || str === undefined)
            throw new MissingArgumentError(nameof(str));

        return XmlParser.parser.parseFromString(str, "text/xml");
    }

    public serialize(xmlNode: Node): string {
        return XmlParser.serializer.serializeToString(xmlNode);
    }

    /**
     * Encode string to make it safe to use inside xml tags.
     * 
     * https://stackoverflow.com/questions/7918868/how-to-escape-xml-entities-in-javascript
     */
    public encode(str: string): string {
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

    public removeNodeAndSiblings(node: Node, goForward = true, stopNode: Node = null): void {
        let nextNode = node;
        do {
            const curNode = nextNode;
            if (goForward) {
                nextNode = nextNode.nextSibling;
            } else {
                nextNode = nextNode.previousSibling;
            }
            curNode.parentNode.removeChild(curNode);

        } while (nextNode && nextNode !== stopNode);
    }

    public indexOfChildNode(parent: Node, child: Node): number {
        if (!parent.hasChildNodes())
            return -1;

        for (let i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes.item(i) === child)
                return i;
        }

        return -1;
    }
}
