import { Docx, OpenXmlPart } from '../office';

export interface TemplateContext {
    docx: Docx;
    currentPart: OpenXmlPart;
    /**
     * Private context for plugins. Key is the plugin contentType.
     */
    pluginContext: Record<string, any>;
    options: TemplateOptions;
}

export interface TemplateOptions {
    maxXmlDepth: number;
}