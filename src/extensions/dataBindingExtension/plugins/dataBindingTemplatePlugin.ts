import { TemplateCompiler } from "../../../compilation";
import { DocxParser } from "../../../office";
import { XmlParser, XmlGeneralNode } from "../../../xml";
import { DataBindingPluginContent } from "./dataBindingPluginContent";
import { ITemplatePlugin } from "src/extensions";

export interface DataBindingPluginUtilities {
  compiler: TemplateCompiler;
  docxParser: DocxParser;
  xmlParser: XmlParser;
}

/* eslint-disable @typescript-eslint/member-ordering */

export abstract class DataBindingTemplatePlugin implements ITemplatePlugin {
  /**
   * The content type this plugin handles.
   */
  public abstract get contentType(): string;
  public abstract setNodeContents(
    node: XmlGeneralNode,
    content: DataBindingPluginContent
  ): void | Promise<void>;

  protected utilities: DataBindingPluginUtilities;

  /**
   * Called by the TemplateHandler at runtime.
   */
  public setUtilities(utilities: DataBindingPluginUtilities) {
    this.utilities = utilities;
  }
}
