
export interface PluginContent {
    _type: string;
    [key: string]: unknown;
}

export const PluginContent = {
    isPluginContent(content: unknown): content is PluginContent {
        return !!content && typeof (content as any)._type === 'string';
    }
};
