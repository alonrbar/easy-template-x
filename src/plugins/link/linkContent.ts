import { PluginContent } from '../pluginContent';

export interface LinkContent extends PluginContent {
    _type: 'link';
    /**
     * If not specified the `target` property will be used.
     */
    text?: string;
    target: string;
}
