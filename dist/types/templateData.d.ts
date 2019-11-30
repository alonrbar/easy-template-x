import { PluginContent } from './plugins';
export declare type PrimitiveTemplateContent = string | number | boolean;
export declare type TemplateContent = PrimitiveTemplateContent | PluginContent;
export interface TemplateData {
    [tagName: string]: TemplateContent | TemplateData | TemplateData[];
}
