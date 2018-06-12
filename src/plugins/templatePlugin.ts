import { ScopeData, Tag, TagPrefix, TemplateCompiler, TemplateContext } from '../compilation';
import { DocxParser } from '../docxParser';
import { XmlParser } from '../xmlParser';

export interface PluginUtilities {
    compiler: TemplateCompiler;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}

export abstract class TemplatePlugin {

    public abstract get prefixes(): TagPrefix[];

    protected utilities: PluginUtilities;

    /**
     * Called by the TemplateHandler at runtime.
     */
    public setUtilities(utilities: PluginUtilities) {
        this.utilities = utilities;
    }

    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): void {
        // noop
    }

    /**
     * This method is called for each container tag. It should implement the
     * specific document manipulation required by the tag.
     *
     * @param tags All tags between the opening tag and closing tag (inclusive,
     * i.e. tags[0] is the opening tag and the last item in the tags array is
     * the closing tag).
     */
    public containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void {
        // noop
    }
}