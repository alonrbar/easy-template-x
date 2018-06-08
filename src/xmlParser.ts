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

    public serialize(xmlNode: XmlNode): string {
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
        if (typeof str !== 'string')
            throw new TypeError(`Expected a string, got '${(str as any).constructor.name}'.`);

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

    /**
     * Clone sibling nodes between 'from' and 'to' excluding both.
     */
    public cloneSiblings(from: XmlNode, to: XmlNode): XmlNode[] {
        if (from === to)
            return [];

        const clones: XmlNode[] = [];

        from = from.nextSibling;
        while (from !== to) {
            clones.push(from.cloneNode());
            from = from.nextSibling;
        }

        return clones;
    }

    /**
     * Remove sibling nodes between 'from' and 'to' excluding both.
     * Return the removed nodes.
     */
    public removeSiblings(from: XmlNode, to: XmlNode): XmlNode[] {
        if (from === to)
            return [];

        const removed: XmlNode[] = [];

        from = from.nextSibling;
        while (from !== to) {
            const removeMe = from;
            from = from.nextSibling;

            removeMe.parentNode.removeChild(removeMe);
            removed.push(removeMe);
        }

        return removed;
    }

    /**
     * Modifies the original node and returns the other part.
     *
     * @param root The node to split
     * @param markerNode The node that marks the split position. 
     * @param afterMarker If true everything the marker node will be extracted
     * into the result node. Else, everything before it will be extracted
     * instead.
     */
    public splitByChild(root: XmlNode, markerNode: XmlNode, afterMarker: boolean, removeMarkerNode: boolean): XmlNode {
        const path = this.getDescendantPath(root, markerNode);

        let clone = root.cloneNode(false);

        const childIndex = path[0] + (afterMarker ? 1 : -1);
        if (afterMarker) {

            // after marker
            while (childIndex < root.childNodes.length) {
                const curChild = root.childNodes.item(childIndex);
                root.removeChild(curChild);
                clone.appendChild(curChild);
            }

            if (removeMarkerNode) {
                root.removeChild(root.lastChild);
            }
        } else {

            // before marker
            const stopChild = root.childNodes.item(childIndex);
            let curChild: XmlNode;
            do {
                curChild = root.firstChild;
                root.removeChild(curChild);
                clone.appendChild(curChild);

            } while (curChild !== stopChild);

            if (removeMarkerNode) {
                root.removeChild(root.firstChild);
            }
        }

        return clone;
    }

    public indexOfChildNode(parent: XmlNode, child: XmlNode): number {
        if (!parent.hasChildNodes())
            return -1;

        for (let i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes.item(i) === child)
                return i;
        }

        return -1;
    }

    private getDescendantPath(root: XmlNode, descendant: XmlNode): number[] {
        const path: number[] = [];

        let node = descendant;
        while (node !== root) {
            const parent = node.parentNode;
            if (!parent)
                throw new Error(`Argument ${nameof(descendant)} is not a descendant of ${nameof(root)}`);

            const curChildIndex = this.indexOfChildNode(parent, node);
            path.push(curChildIndex);

            node = parent;
        }

        return path.reverse();
    }
}
