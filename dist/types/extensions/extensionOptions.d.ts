import { TemplateExtension } from "./templateExtension";
export interface ExtensionOptions {
    beforeCompilation?: TemplateExtension[];
    afterCompilation?: TemplateExtension[];
}
