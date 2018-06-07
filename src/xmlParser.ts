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

    /**
     * Clone sibling nodes between 'from' and 'to' excluding both.
     */
    public cloneSiblings(from: Node, to: Node): Node[] {
        if (from === to)
            return [];

        const clones: Node[] = [];

        from = from.nextSibling;
        while (from !== to) {
            clones.push(from.cloneNode());
            from = from.nextSibling;
        }

        return clones;
    }

    /**
     * Remove sibling nodes between 'from' and 'to' excluding both.
     */
    public removeSiblings(from: Node, to: Node): void {
        if (from === to)
            return;

        from = from.nextSibling;
        while (from !== to) {
            const removeMe = from;
            from = from.nextSibling;
            removeMe.parentNode.removeChild(removeMe);
        }
    }

    /**
     * Modifies the original node and returns the other part.
     *
     * @param root The node to split
     * @param markerNode The node that marks the split position
     */
    public splitByChild(root: Node, markerNode: Node): Node {
        const path = this.getDescendantPath(root, markerNode);

        const clone = root.cloneNode(false);
        for (const childIndex of path) {
            throw new Error('not implemented...');
        }

        return clone;
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

    private getDescendantPath(root: Node, descendant: Node): number[] {
        const path: number[] = [];

        let node = descendant;
        while (node !== root) {
            const parent = node.parentNode;
            const curChildIndex = this.indexOfChildNode(parent, node);
            path.push(curChildIndex);
        }

        return path.reverse();
    }
}
