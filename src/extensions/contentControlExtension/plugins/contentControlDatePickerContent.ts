import { ContentControlPluginContent } from "./contentControlPluginContent";

export interface ContentControlDatePickerContent
    extends ContentControlPluginContent {
    _type: "datePicker";
    date: Date;
}
