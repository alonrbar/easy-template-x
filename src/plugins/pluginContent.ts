
export interface PluginContent {
    _type: string;
}

export const PluginContent = {
    isPluginContent(content: any): content is PluginContent {
        return !!content && typeof content._type === 'string';
    }
};