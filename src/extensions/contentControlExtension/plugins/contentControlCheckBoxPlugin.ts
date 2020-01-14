import { ContentControlTemplatePlugin } from "./contentControlTemplatePlugin";
import { XmlGeneralNode, XmlNode, XmlTextNode } from "../../../xml";
import { DocxParser } from "../../../office";
import { ContentControlCheckBoxContent } from "./contentControlCheckBoxContent";
import { first } from "../../../utils";

export class ContentControlCheckBoxPlugin extends ContentControlTemplatePlugin {
    public get contentType(): string {
        return "checkBox";
    }

    public setNodeContents(
        node: XmlGeneralNode,
        content: ContentControlCheckBoxContent
    ): void | Promise<void> {
        const structuredDocumentTagContentNode: XmlGeneralNode = XmlNode.findChildByName(
            node,
            DocxParser.STRUCTURED_DOCUMENT_TAG_CONTENT_NODE
        ) as XmlGeneralNode;
        if (!structuredDocumentTagContentNode) {
            return;
        }

        const tNodes: XmlNode[] = XmlNode.findDescendantsByName(
            structuredDocumentTagContentNode,
            DocxParser.TEXT_NODE
        );
        const tNode: XmlNode = first(tNodes);
        if (!tNode) {
            return;
        }

        const textNode: XmlTextNode = XmlNode.lastTextChild(tNode);
        if (content.checked) {
            textNode.textContent = textNode.textContent.replace("☐", "☒");
        } else {
            textNode.textContent = textNode.textContent.replace("☒", "☐");
        }

        const structuredDocumentTagPropertiesNode: XmlGeneralNode = XmlNode.findChildByName(
            node,
            DocxParser.STRUCTURED_DOCUMENT_TAG_PROPERTIES_NODE
        ) as XmlGeneralNode;
        if (!structuredDocumentTagPropertiesNode) {
            return;
        }

        const checkedNode: XmlGeneralNode = first(
            XmlNode.findDescendantsByName(
                structuredDocumentTagPropertiesNode,
                "w14:checked"
            )
        );
        if (!checkedNode) {
            return;
        }

        checkedNode.attributes["w14:val"] = content.checked ? "1" : "0";
    }
}
