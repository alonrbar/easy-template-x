import * as JSZip from 'jszip';
import { Tag, TagPrefix } from '../compilation/tag';
import { TemplateCompiler } from '../compilation/templateCompiler';
import { DocxParser } from '../docxParser';
import { XmlParser } from '../xmlParser';

export class TemplatePluginContext {
    public compiler: TemplateCompiler;
    public docxParser: DocxParser;
    public xmlParser: XmlParser;
}

export interface TagReplacementContext {
    dataPath: string[];
    allData: any;
    scopeData: any;
    docFile: JSZip;
    currentFilePath: string;
}

export abstract class TemplatePlugin {

    public abstract get prefixes(): TagPrefix[];

    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     * It should return true if successfully replaced.
     * 
     * @param data Relevant part of the data
     */
    public simpleTagReplacements(tag: Tag, data: any): void {
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
    public containerTagReplacements(tags: Tag[], data: any): void {
        // noop
    }
}