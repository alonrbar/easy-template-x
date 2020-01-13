export interface DataBindingPluginContent {
  _type: string;
}

export const DataBindingPluginContent = {
  isPluginContent(content: any): content is DataBindingPluginContent {
    return !!content && typeof content._type === "string";
  }
};
