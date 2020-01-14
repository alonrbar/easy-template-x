import { ContentControlTemplatePlugin } from "./contentControlTemplatePlugin";
import { XmlGeneralNode, XmlNode } from "../../../xml";
import { DocxParser } from "../../../office";
import { ContentControlRichTextContent } from "./contentControlRichTextContent";
import { first } from "../../../utils";

export class ContentControlRichTextPlugin extends ContentControlTemplatePlugin {
    public get contentType(): string {
        return "richText";
    }

    public setNodeContents(
        node: XmlGeneralNode,
        content: ContentControlRichTextContent
    ): void | Promise<void> {
        const structuredDocumentTagContentNode: XmlGeneralNode = XmlNode.findChildByName(
            node,
            DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE
        ) as XmlGeneralNode;
        if (!structuredDocumentTagContentNode) {
            return;
        }

        XmlNode.remove(structuredDocumentTagContentNode);
        XmlNode.appendChild(
            node,
            this.utilities.xmlParser.parse(
                `<${DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE}>${content.xml}</${DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE}>`
            )
        );

        const textNode: XmlNode = first(
            XmlNode.findDescendantsByName(
                structuredDocumentTagContentNode,
                DocxParser.TEXT_NODE
            )
        );
        if (!textNode) {
            return;
        }

        const contentNode: XmlNode = this.utilities.xmlParser.parse(content.xml);

        XmlNode.remove(XmlNode.lastTextChild(textNode));
        XmlNode.appendChild(textNode, contentNode);
    }
}
