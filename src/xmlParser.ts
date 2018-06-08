import { MissingArgumentError } from './errors';
import { last, platform } from './utils';
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

    private static readonly parser = new DomParserType();

    public parse(str: string): XmlNode {
        if (str === null || str === undefined)
            throw new MissingArgumentError(nameof(str));

        const domNode = XmlParser.parser.parseFromString(str, "text/xml");
        return XmlNode.fromDomNode(domNode, true);
    }

    public serialize(xmlNode: XmlNode): string {
        return XmlParser.serializer.serializeToString(xmlNode);
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

            XmlNode.remove(removeMe);
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

        let clone = XmlNode.cloneNode(root, false);

        const childIndex = path[0] + (afterMarker ? 1 : -1);
        if (afterMarker) {

            // after marker
            while (childIndex < root.childNodes.length) {
                const curChild = root.childNodes[childIndex];
                XmlNode.remove(curChild);
                XmlNode.appendChild(clone, curChild);
            }

            if (removeMarkerNode) {
                XmlNode.remove(last(root.childNodes));
            }
        } else {

            // before marker
            const stopChild = root.childNodes[childIndex];
            let curChild: XmlNode;
            do {
                curChild = root.childNodes[0];
                XmlNode.remove(curChild);
                XmlNode.appendChild(clone, curChild);

            } while (curChild !== stopChild);

            if (removeMarkerNode) {
                XmlNode.remove(root.childNodes[0]);
            }
        }

        return clone;
    }

    private getDescendantPath(root: XmlNode, descendant: XmlNode): number[] {
        const path: number[] = [];

        let node = descendant;
        while (node !== root) {
            const parent = node.parentNode;
            if (!parent)
                throw new Error(`Argument ${nameof(descendant)} is not a descendant of ${nameof(root)}`);

            const curChildIndex = parent.childNodes.indexOf(node);
            path.push(curChildIndex);

            node = parent;
        }

        return path.reverse();
    }
}
