import { PluginContent } from '../pluginContent';

export interface RawXmlMultiParagraphContent extends PluginContent {
    _type: 'rawXmlMultiParagraph';
    xml: string[];
    /**
     * Replace a part of the document with raw xml content.
     * If set to `true` the plugin will replace the parent paragraph (<w:p>) of
     * the tag, otherwise it will replace the parent text node (<w:t>).
     */
    replaceParagraph?: boolean;
}
