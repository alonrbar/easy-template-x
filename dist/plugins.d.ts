import { ScopeData, TemplateCompiler, TemplateContext } from './compliation';
import { MimeType } from './misc';
import { DocxParser } from './office';
import { Tag } from './tag';
import { XmlParser } from './xml';

export interface PluginUtilities {

    compiler: TemplateCompiler;

    docxParser: DocxParser;

    xmlParser: XmlParser;
}

/* eslint-disable @typescript-eslint/member-ordering */

export abstract class TemplatePlugin {

    /**
     * The content type this plugin handles.
     */
    abstract get contentType(): string;

    /**
     * Called by the TemplateHandler at runtime.
     */
    setUtilities(utilities: PluginUtilities): void;
    /**
     * This method is called for each self-closing tag.
     * It should implement the specific document manipulation required by the tag.
     */
    simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): void | Promise<void>;
    /**
     * This method is called for each container tag. It should implement the
     * specific document manipulation required by the tag.
     *
     * @param tags All tags between the opening tag and closing tag (inclusive,
     * i.e. tags[0] is the opening tag and the last item in the tags array is
     * the closing tag).
     */
    containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): void | Promise<void>;
}

/* eslint-enable */

export interface PluginContent {
    _type: string;
}

export const TEXT_CONTENT_TYPE = 'text';

export class TextPlugin extends TemplatePlugin {
    readonly contentType = TEXT_CONTENT_TYPE;
}

export const LOOP_CONTENT_TYPE = 'loop';

export class LoopPlugin extends TemplatePlugin {
    readonly contentType = LOOP_CONTENT_TYPE;
}

export interface RawXmlContent extends PluginContent {
    _type: 'rawXml';
    xml: string;
}

export class RawXmlPlugin extends TemplatePlugin {
    readonly contentType = 'rawXml';
}

export type ImageFormat = MimeType.Jpeg | MimeType.Png | MimeType.Gif | MimeType.Bmp | MimeType.Svg;

export interface ImageContent extends PluginContent {
    _type: 'image';
    source: Binary;
    format: ImageFormat;
    width: number;
    height: number;
}

export class ImagePlugin extends TemplatePlugin {
    readonly contentType = 'image';
}