import { ImageContent, LinkContent, RawXmlContent } from './plugins';
export declare type PrimitiveTemplateContent = string | number | boolean;
export declare type PluginTemplateContent = ImageContent | RawXmlContent | LinkContent;
export declare type TemplateContent = PrimitiveTemplateContent | PluginTemplateContent;
export interface TemplateData {
    [tagName: string]: TemplateContent | TemplateData | TemplateData[];
}
