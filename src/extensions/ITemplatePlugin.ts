import { PluginUtilities, XmlNode, PluginContent } from "src";

export interface ITemplatePlugin {
    setNodeContents(textNode: XmlNode, content: PluginContent): void;
    setUtilities(utilities: PluginUtilities): void;
    readonly contentType: string;
}
