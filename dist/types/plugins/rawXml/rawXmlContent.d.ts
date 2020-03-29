import { PluginContent } from '../pluginContent';
export interface RawXmlContent extends PluginContent {
    _type: 'rawXml';
    xml: string;
    replaceParagraph?: boolean;
}
