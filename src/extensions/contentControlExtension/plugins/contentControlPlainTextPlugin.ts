import { ContentControlTemplatePlugin } from "./contentControlTemplatePlugin";
import { XmlGeneralNode, XmlNode } from "../../../xml";
import { DocxParser } from "../../../office";
import { ContentControlPlainTextContent } from "./contentControlPlainTextContent";
import { first } from "../../../utils";

export class ContentControlPlainTextPlugin extends ContentControlTemplatePlugin {
  public get contentType(): string {
    return "plainText";
  }

  public setNodeContents(
    node: XmlGeneralNode,
    content: ContentControlPlainTextContent
  ): void | Promise<void> {
    const structuredDocumentTagContentNode: XmlGeneralNode = XmlNode.findChildByName(
      node,
      DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE
    ) as XmlGeneralNode;
    if (!structuredDocumentTagContentNode) {
      return;
    }

    // const updatedNode = this.utilities.xmlParser.parse(`
    //     <${DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE}>
    //         <w:t>
    //             ${content.text}
    //         </w:t>
    //     </${DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE}>
    // `);

    // XmlNode.remove(structuredDocumentTagContentNode);
    // XmlNode.appendChild(node, updatedNode);

    const textNode: XmlNode = first(
      XmlNode.findDescendantsByName(
        structuredDocumentTagContentNode,
        DocxParser.TEXT_NODE
      )
    );
    if (!textNode) {
      return;
    }

    const contentNode: XmlNode = XmlNode.createTextNode(content.text);

    XmlNode.remove(XmlNode.lastTextChild(textNode));
    XmlNode.appendChild(textNode, contentNode);
  }
}
