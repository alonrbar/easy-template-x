import { DataBindingPluginContent } from "./dataBindingPluginContent";

export interface DataBindingTextContent extends DataBindingPluginContent {
  _type: "text";
  value: string;
}
