import { TemplateContext, ScopeData } from '../compilation';
import { TemplateCompiler } from '../compilation/templateCompiler';
import { DocxParser } from '../office';
import { XmlParser } from '../xml';

export interface ExtensionUtilities {
    compiler: TemplateCompiler;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}
export abstract class TemplateExtension {

    protected utilities: ExtensionUtilities;

    /**
     * Called by the TemplateHandler at runtime.
     */
    public setUtilities(utilities: ExtensionUtilities) {
        this.utilities = utilities;
    }

    public abstract execute(utilities: ExtensionUtilities, data: ScopeData, context: TemplateContext): void | Promise<void>;
}
