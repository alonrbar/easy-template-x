import { ScopeData, TagParser, TemplateCompiler, TemplateContext } from '../compilation';
import { DocxParser } from '../office';
import { XmlParser } from '../xml';

export interface ExtensionUtilities {
    compiler: TemplateCompiler;
    tagParser: TagParser;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}

export abstract class TemplateExtension {

    protected utilities: ExtensionUtilities;

    /**
     * Called by the TemplateHandler at runtime.
     */
    public setUtilities(utilities: ExtensionUtilities): void {
        this.utilities = utilities;
    }

    public abstract execute(data: ScopeData, context: TemplateContext): void | Promise<void>;
}
