import { TemplateCompiler } from "../../../compilation";
import { DocxParser } from "../../../office";
import { XmlParser, XmlGeneralNode } from "../../../xml";
import { ContentControlPluginContent } from "./contentControlPluginContent";
import { ITemplatePlugin } from "src/extensions";

export interface ContentControlPluginUtilities {
  compiler: TemplateCompiler;
  docxParser: DocxParser;
  xmlParser: XmlParser;
}

/* eslint-disable @typescript-eslint/member-ordering */

export abstract class ContentControlTemplatePlugin implements ITemplatePlugin {
  /**
   * The content type this plugin handles.
   */
  public abstract get contentType(): string;
  public abstract setNodeContents(
    node: XmlGeneralNode,
    content: ContentControlPluginContent
  ): void | Promise<void>;

  protected utilities: ContentControlPluginUtilities;

  /**
   * Called by the TemplateHandler at runtime.
   */
  public setUtilities(utilities: ContentControlPluginUtilities): void {
    this.utilities = utilities;
  }
}
