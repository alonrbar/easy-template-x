
export interface PluginContent {
    _type: string;
}

export const PluginContent = {
    isPluginContent(content: unknown): content is PluginContent {
        return !!content && typeof (content as any)._type === 'string';
    }
};
