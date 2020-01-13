import { ContentControlPluginContent } from "./contentControlPluginContent";

export interface ContentControlRichTextContent
  extends ContentControlPluginContent {
  _type: "richText";
  xml: string;
}
