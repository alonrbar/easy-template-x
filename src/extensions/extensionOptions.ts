import { TemplateExtension } from ".";

export interface ExtensionOptions {
    beforeCompilation: TemplateExtension[];
    afterCompilation: TemplateExtension[];
}