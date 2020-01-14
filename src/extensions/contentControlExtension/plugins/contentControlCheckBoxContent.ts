import { ContentControlPluginContent } from "./contentControlPluginContent";

export interface ContentControlCheckBoxContent
    extends ContentControlPluginContent {
    _type: "checkBox";
    checked: boolean;
}
