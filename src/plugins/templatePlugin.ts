import * as JSZip from 'jszip';
import { ScopeData, Tag, TagPrefix, TemplateCompiler } from '../compilation';
import { DocxParser } from '../docxParser';
import { XmlParser } from '../xmlParser';

export interface PluginUtilities {
    compiler: TemplateCompiler;
    docxParser: DocxParser;
    xmlParser: XmlParser;
}

export interface TagReplacementContext {
    data: ScopeData;
    zipFile: JSZip;
    currentFilePath: string;
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
     * It should return true if successfully replaced.
     * 
     * @param data Relevant part of the data
     */
    public simpleTagReplacements(tag: Tag, data: ScopeData): void {
        // noop
    }

    /**
     * This method is called for each container tag.
     * It should implement the specific document manipulation required by the tag.
     * It should return true if successfully replaced.
     * 
     * @param tags All tags between the opening tag and the closing tag (inclusive).
     * @param data Relevant part of the data
     */
    public containerTagReplacements(tags: Tag[], data: ScopeData): void {
        // noop
    }
}