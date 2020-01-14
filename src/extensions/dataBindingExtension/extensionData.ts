import { DataBindingPluginContent } from "./plugins/dataBindingPluginContent";

export type PrimitiveTemplateContent = string | number | boolean;

export type PluginTemplateContent = DataBindingPluginContent;

export type ExtensionContent = PrimitiveTemplateContent | PluginTemplateContent;

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

export interface ExtensionData {
    [tagName: string]: ExtensionContent;
}
