import { DataBindingPluginContent } from "./dataBindingPluginContent";

export interface DataBindingBooleanContent extends DataBindingPluginContent {
  _type: "boolean";
  value: boolean;
}
