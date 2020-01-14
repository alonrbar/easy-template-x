import { XmlNode, XmlGeneralNode, XmlNodeType } from "../../xml";
import { ScopeData, TemplateContext } from "../../compilation";
import { DataBindingPluginContent } from "./plugins";
import { UnknownContentTypeError } from "../../errors";
import { IExtensionUtilities } from "..";
import { TemplateExtension } from "../templateExtension";
import { first } from "../../utils";

/* eslint-disable @typescript-eslint/member-ordering */

export class DataBindingExtension extends TemplateExtension {
  protected utilities: IExtensionUtilities;

  public async getXmlDocuments(
    templateContext: TemplateContext
  ): Promise<Map<string, XmlNode>> {
    return await templateContext.docx.getCustomXmlFiles();
  }

  public updateNode(node: XmlGeneralNode, data: ScopeData): void {
    this.utilities.docxParser;

    const value: string = XmlNode.getPath(node);

    const content = data.allData[value] as DataBindingPluginContent;
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
    if (node.nodeType === XmlNodeType.Text) {
      return false;
    }

    if (!node.childNodes) {
      return true;
    }

    if (node.childNodes.length === 0) {
      return true;
    }

    if (first(node.childNodes).nodeType === XmlNodeType.Text) {
      return true;
    }

    return false;
  }
}
