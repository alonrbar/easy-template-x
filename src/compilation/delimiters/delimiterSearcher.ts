import { XmlNode, XmlTreeIterator } from "src/xml";
import { AttributesDelimiterSearcher } from "./attributesDelimiterSearcher";
import { TextNodeDelimiterMark } from "./delimiterMark";
import { TextNodesDelimiterSearcher } from "./textNodesDelimiterSearcher";

export class DelimiterSearcher {

    public maxXmlDepth = 20;
    public startDelimiter = "{";
    public endDelimiter = "}";

    public findDelimiters(node: XmlNode): TextNodeDelimiterMark[] {

        const delimiters: TextNodeDelimiterMark[] = [];
        const it = new XmlTreeIterator(node, this.maxXmlDepth);
        
        const attributeSearcher = new AttributesDelimiterSearcher(this.startDelimiter, this.endDelimiter);
        const textSearcher = new TextNodesDelimiterSearcher(this.startDelimiter, this.endDelimiter);

        while (it.node) {
            attributeSearcher.processNode(it, delimiters);
            textSearcher.processNode(it, delimiters);
            it.next();
        }

        return delimiters;
    }
}
