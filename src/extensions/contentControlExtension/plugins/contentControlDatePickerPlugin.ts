import { ContentControlTemplatePlugin } from "./contentControlTemplatePlugin";
import { XmlGeneralNode, XmlNode } from "../../../xml";
import { DocxParser } from "../../../office";
import { ContentControlDatePickerContent } from "./contentControlDatePickerContent";
import { first } from "../../../utils";

export class ContentControlDatePickerPlugin extends ContentControlTemplatePlugin {
  public get contentType(): string {
    return "datePicker";
  }

  public setNodeContents(
    node: XmlGeneralNode,
    content: ContentControlDatePickerContent
  ): void | Promise<void> {
    const structuredDocumentTagContentNode: XmlGeneralNode = XmlNode.findChildByName(
      node,
      DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE
    ) as XmlGeneralNode;
    if (!structuredDocumentTagContentNode) {
      return;
    }

    const textNode: XmlNode = first(
      XmlNode.findDescendantsByName(
        structuredDocumentTagContentNode,
        DocxParser.TEXT_NODE
      )
    );
    if (!textNode) {
      return;
    }

    const contentNode: XmlNode = XmlNode.createTextNode(
      content.date.toLocaleDateString()
    );

    XmlNode.remove(XmlNode.lastTextChild(textNode));
    XmlNode.appendChild(textNode, contentNode);

    const structuredDocumentTagPropertiesNode: XmlGeneralNode = XmlNode.findChildByName(
      node,
      DocxParser.STRUCTURED_DOCUMENT_TAG_PROPERTIES_NODE
    ) as XmlGeneralNode;
    if (!structuredDocumentTagPropertiesNode) {
      return;
    }

    const dateNode: XmlGeneralNode = first(
      XmlNode.findDescendantsByName(
        structuredDocumentTagPropertiesNode,
        "w:date"
      )
    );
    if (!dateNode) {
      return;
    }

    dateNode.attributes["w:fullDate"] = content.date.toISOString();
  }
}
