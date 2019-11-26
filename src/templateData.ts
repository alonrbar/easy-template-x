import { PluginContent } from './plugins';

export type PrimitiveTemplateContent = string | number | boolean;

export type TemplateContent = PrimitiveTemplateContent | PluginContent;

//
// Sadly `TemplateData` cannot be properly used since the following code does not compile:
//
// const data = {
//     myProp: {
//         _type: 'image',
//         format: MimeType.Jpeg,
//         source: imageFile,
//         height: 325,
//         width: 600
//     }
// };
//
// const doc = await handler.process(template, data);
//
// (tested with TypeScript 3.5.3)
//

export interface TemplateData {
    [tagName: string]: TemplateContent | TemplateData | TemplateData[];
}