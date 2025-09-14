import { TagPlacement } from "src/compilation/tag";
import { tagRegex } from "src/compilation/tagUtils";
import { Delimiters } from "src/delimiters";
import { InternalArgumentMissingError } from "src/errors";
import { OmlNode } from "src/office";
import { xml, XmlGeneralNode, XmlTreeIterator } from "src/xml";
import { AttributeDelimiterMark, DelimiterMark } from "./delimiterMark";

const drawingDescriptionAttributeName = "descr";

export class AttributesDelimiterSearcher {

    private readonly delimiters: Delimiters;
    private readonly tagRegex: RegExp;

    constructor(delimiters: Delimiters) {
        if (!delimiters)
            throw new InternalArgumentMissingError("delimiters");

        this.delimiters = delimiters;
        this.tagRegex = tagRegex(delimiters, true);
    }

    public processNode(it: XmlTreeIterator, delimiters: DelimiterMark[]): void {

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
        if (!it.node.attributes[drawingDescriptionAttributeName]) {
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

    private findDelimiters(it: XmlTreeIterator<XmlGeneralNode>, delimiters: DelimiterMark[]): void {

        // Currently we only support description attributes of drawing objects
        this.findDelimitersInAttribute(it.node, drawingDescriptionAttributeName, delimiters);
    }

    private findDelimitersInAttribute(node: XmlGeneralNode, attributeName: string, delimiters: DelimiterMark[]): void {
        const attrValue = node.attributes?.[attributeName];
        if (!attrValue) {
            return;
        }

        const matches = attrValue.matchAll(this.tagRegex);
        for (const match of matches) {
            const tag = match[0];
            const openDelimiterIndex = match.index;
            const closeDelimiterIndex = openDelimiterIndex + tag.length - this.delimiters.tagEnd.length;

            const openDelimiter = this.createCurrentDelimiterMark(openDelimiterIndex, true, node, attributeName);
            const closeDelimiter = this.createCurrentDelimiterMark(closeDelimiterIndex, false, node, attributeName);
            delimiters.push(openDelimiter);
            delimiters.push(closeDelimiter);
        }
    }

    private createCurrentDelimiterMark(index: number, isOpen: boolean, xmlNode: XmlGeneralNode, attributeName: string): AttributeDelimiterMark {
        return {
            isOpen: isOpen,
            placement: TagPlacement.Attribute,
            xmlNode: xmlNode,
            attributeName: attributeName,
            index: index,
        };
    }
}
