import { ScopeData, Tag, TemplateCompiler, TemplateContext } from '../compilation';
import { DocxParser } from '../office';
import { XmlParser } from '../xml';
export interface PluginUtilities {
    compiler: TemplateCompiler;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}
export declare abstract class TemplatePlugin {
    abstract readonly contentType: string;
    protected utilities: PluginUtilities;
    setUtilities(utilities: PluginUtilities): void;
    simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): void | Promise<void>;
    containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void | Promise<void>;
}
