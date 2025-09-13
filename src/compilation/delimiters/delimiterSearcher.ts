import { officeMarkup } from "src/office";
import { XmlNode, XmlTreeIterator } from "src/xml";
import { TextNodeDelimiterMark } from "./delimiterMark";
import { TextNodesDelimiterSearcher } from "./textNodesDelimiterSearcher";

export class DelimiterSearcher {

    public maxXmlDepth = 20;
    public startDelimiter = "{";
    public endDelimiter = "}";

    public findDelimiters(node: XmlNode): TextNodeDelimiterMark[] {

        const delimiters: TextNodeDelimiterMark[] = [];
        const it = new XmlTreeIterator(node, this.maxXmlDepth);
        
        const textSearcher = new TextNodesDelimiterSearcher(this.startDelimiter, this.endDelimiter);

        while (it.node) {
            textSearcher.processNode(it, delimiters);
            it.next();
        }

        return delimiters;
    }
}
