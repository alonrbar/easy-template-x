import { TagPlacement } from "src/compilation/tag";
import { OmlNode } from "src/office";
import { xml, XmlGeneralNode, XmlTreeIterator } from "src/xml";
import { AttributeDelimiterMark, TextNodeDelimiterMark } from "./delimiterMark";

export class AttributesDelimiterSearcher {    

    private readonly startDelimiter: string;
    private readonly endDelimiter: string;

    public constructor(startDelimiter: string, endDelimiter: string) {
        this.startDelimiter = startDelimiter;
        this.endDelimiter = endDelimiter;
    }

    public processNode(it: XmlTreeIterator, delimiters: TextNodeDelimiterMark[]): void {

        // Ignore irrelevant nodes
        if (!this.shouldSearchNode(it)) {
            return;
        }

        // Search delimiters in attributes
        this.findDelimiters(it, delimiters);
    }

    private shouldSearchNode(it: XmlTreeIterator): it is XmlTreeIterator<XmlGeneralNode> {

        if (!xml.query.isGeneralNode(it.node))
            return false;
        if (Object.keys(it.node.attributes || {}).length === 0)
            return false;

        // Currently we only support description attributes of drawing objects
        if (!this.isDrawingPropertiesNode(it.node)) {
            return false;
        }
        if (!it.node.attributes["descr"]) {
            return false;
        }

        return true;
    }

    private isDrawingPropertiesNode(node: XmlGeneralNode): boolean {
        
        // Node is drawing properties
        if (node.nodeName !== OmlNode.Wp.DocPr) {
            return false;
        }

        // Parent is drawing
        if (!node.parentNode) {
            return false;
        }
        const parent = xml.query.findParentByName(node, OmlNode.W.Drawing);
        return !!parent;
    }

    private findDelimiters(it: XmlTreeIterator<XmlGeneralNode>, delimiters: TextNodeDelimiterMark[]): void {
        // TODO
    }

    private createCurrentDelimiterMark(): AttributeDelimiterMark {
        return {
            placement: TagPlacement.Attribute,
            index: 0,
            isOpen: true,
            xmlNode: null,
            attributeName: "descr",
        };
    }
}
