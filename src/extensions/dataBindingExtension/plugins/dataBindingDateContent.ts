import { DataBindingPluginContent } from "./dataBindingPluginContent";

export interface DataBindingDateContent extends DataBindingPluginContent {
    _type: "date";
    value: Date;
}
