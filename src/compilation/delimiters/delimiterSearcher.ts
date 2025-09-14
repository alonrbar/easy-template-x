import { Delimiters } from "src/delimiters";
import { InternalArgumentMissingError } from "src/errors";
import { XmlNode, XmlTreeIterator } from "src/xml";
import { AttributesDelimiterSearcher } from "./attributesDelimiterSearcher";
import { TextNodeDelimiterMark } from "./delimiterMark";
import { TextNodesDelimiterSearcher } from "./textNodesDelimiterSearcher";

export class DelimiterSearcher {

    private readonly maxXmlDepth: number;
    private readonly delimiters: Delimiters;

    constructor(delimiters: Delimiters, maxXmlDepth: number) {
        if (!delimiters) {
            throw new InternalArgumentMissingError("delimiters");
        }
        if (!maxXmlDepth) {
            throw new InternalArgumentMissingError("maxXmlDepth");
        }

        this.delimiters = delimiters;
        this.maxXmlDepth = maxXmlDepth;
    }

    public findDelimiters(node: XmlNode): TextNodeDelimiterMark[] {

        const delimiters: TextNodeDelimiterMark[] = [];
        const it = new XmlTreeIterator(node, this.maxXmlDepth);
        
        const attributeSearcher = new AttributesDelimiterSearcher(this.delimiters);
        const textSearcher = new TextNodesDelimiterSearcher(this.delimiters.tagStart, this.delimiters.tagEnd);

        while (it.node) {
            attributeSearcher.processNode(it, delimiters);
            textSearcher.processNode(it, delimiters);
            it.next();
        }

        return delimiters;
    }
}
