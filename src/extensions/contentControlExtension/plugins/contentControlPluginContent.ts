export interface ContentControlPluginContent {
    _type: string;
}

export const ContentControlPluginContent = {
    isPluginContent(content: any): content is ContentControlPluginContent {
        return !!content && typeof content._type === "string";
    }
};
