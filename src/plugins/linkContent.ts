import { PluginContent } from './pluginContent';

export interface LinkContent extends PluginContent {
    _type: 'link';
    /**
     * If not specified `target` is used instead.
     */
    text?: string;
    target: string;
}