import { TemplateExtension } from "../templateExtension";
import { XmlNode, XmlGeneralNode } from "../../xml";
import { DocxParser } from "../../office";
import { ScopeData, TemplateContext } from "../../compilation";
import { ContentControlPluginContent } from "./plugins";
import { UnknownContentTypeError } from "../../errors";

/* eslint-disable @typescript-eslint/member-ordering */

export class ContentControlExtension extends TemplateExtension {
    public async getXmlDocuments(
        templateContext: TemplateContext
    ): Promise<Map<string, XmlNode>> {
        const files: Map<string, XmlNode> = new Map<string, XmlNode>();
        files.set("Document", await templateContext.docx.getDocument());
        return files;
    }

    public updateNode(node: XmlGeneralNode, data: ScopeData): void {
        const properties: XmlGeneralNode = XmlNode.findChildByName(
            node,
            DocxParser.STRUCTURED_DOCUMENT_TAG_PROPERTIES_NODE
        ) as XmlGeneralNode;
        if (!properties) {
            return;
        }

        const id: XmlGeneralNode | void = XmlNode.findChildByName(
            properties,
            DocxParser.ID_NODE
        ) as XmlGeneralNode;
        if (!id) {
            return;
        }

        const value: string = id.attributes[DocxParser.VALUE_ATTRIBUTE];
        if (!value) {
            return;
        }

        const content = data.allData[value] as ContentControlPluginContent;
        if (!content) {
            return;
        }

        const contentType = content._type;

        const plugin = this.pluginsLookup[contentType];
        if (!plugin) {
            throw new UnknownContentTypeError(
                contentType,
                value,
                data.path.join(".")
            );
        }

        plugin.setNodeContents(node, content);
    }

    public isMatch(node: XmlNode): boolean {
        return this.utilities.docxParser.isStructuredDocumentTagNode(node);
    }
}
