import { PluginContent } from '../pluginContent';
export interface LinkContent extends PluginContent {
    _type: 'link';
    text?: string;
    target: string;
}
