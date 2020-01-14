import { ContentControlPluginContent } from "./contentControlPluginContent";

export interface ContentControlPlainTextContent
  extends ContentControlPluginContent {
  _type: "plainText";
  text: string;
}
