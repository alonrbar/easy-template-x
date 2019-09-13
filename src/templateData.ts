import { ImageContent, RawXmlContent } from './plugins';

export type TemplateContent = string | number | boolean | ImageContent | RawXmlContent;

export interface TemplateData {
    [tagName: string]: TemplateContent | TemplateData | TemplateData[];
}