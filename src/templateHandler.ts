import { DelimiterSearcher, ScopeData, Tag, TagParser, TemplateCompiler, TemplateContext } from "./compilation";
import { Delimiters } from "./delimiters";
import { TemplateExtension } from "./extensions";
import { Docx, OpenXmlPart, RelType } from "./office";
import { TemplateData } from "./templateData";
import { TemplateHandlerOptions } from "./templateHandlerOptions";
import { Binary } from "./utils";
import { XmlNode } from "./xml";

export class TemplateHandler {

    /**
     * Version number of the `easy-template-x` library.
     */
    public readonly version = (typeof EASY_VERSION !== 'undefined' ? EASY_VERSION : 'null');

    private readonly compiler: TemplateCompiler;

    private readonly options: TemplateHandlerOptions;

    constructor(options?: TemplateHandlerOptions) {
        this.options = new TemplateHandlerOptions(options);

        //
        // this is the library's composition root
        //

        const delimiterSearcher = new DelimiterSearcher();
        delimiterSearcher.startDelimiter = this.options.delimiters.tagStart;
        delimiterSearcher.endDelimiter = this.options.delimiters.tagEnd;
        delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;

        const tagParser = new TagParser(this.options.delimiters as Delimiters);

        this.compiler = new TemplateCompiler(
            delimiterSearcher,
            tagParser,
            this.options.plugins,
            {
                skipEmptyTags: this.options.skipEmptyTags,
                defaultContentType: this.options.defaultContentType,
                containerContentType: this.options.containerContentType
            }
        );

        this.options.plugins.forEach(plugin => {
            plugin.setUtilities({
                compiler: this.compiler
            });
        });

        const extensionUtilities = {
            tagParser,
            compiler: this.compiler
        };

        this.options.extensions?.beforeCompilation?.forEach(extension => {
            extension.setUtilities(extensionUtilities);
        });

        this.options.extensions?.afterCompilation?.forEach(extension => {
            extension.setUtilities(extensionUtilities);
        });
    }

    //
    // public methods
    //

    public async process<T extends Binary>(templateFile: T, data: TemplateData): Promise<T> {

        // load the docx file
        const docx = await Docx.load(templateFile);

        // prepare context
        const scopeData = new ScopeData(data);
        scopeData.scopeDataResolver = this.options.scopeDataResolver;
        const context: TemplateContext = {
            docx,
            currentPart: null,
            pluginContext: {},
            options: {
                maxXmlDepth: this.options.maxXmlDepth
            }
        };

        const contentParts = await docx.getContentParts();
        for (const part of contentParts) {

            context.currentPart = part;

            // extensions - before compilation
            await this.callExtensions(this.options.extensions?.beforeCompilation, scopeData, context);

            // compilation (do replacements)
            const xmlRoot = await part.xmlRoot();
            await this.compiler.compile(xmlRoot, scopeData, context);

            // extensions - after compilation
            await this.callExtensions(this.options.extensions?.afterCompilation, scopeData, context);
        }

        // export the result
        return docx.export();
    }

    public async parseTags(templateFile: Binary): Promise<Tag[]> {
        const docx = await Docx.load(templateFile);

        const tags: Tag[] = [];
        const parts = await docx.getContentParts();
        for (const part of parts) {

            const xmlRoot = await part.xmlRoot();
            const partTags = this.compiler.parseTags(xmlRoot);
            if (partTags?.length) {
                tags.push(...partTags);
            }
        }

        return tags;
    }

    /**
     * Get the text content of one or more parts of the document.
     * If more than one part exists, the concatenated text content of all parts is returned.
     * If no matching parts are found, returns an empty string.
     *
     * @param relType
     * The relationship type of the parts whose text content you want to retrieve.
     * Defaults to `RelType.MainDocument`.
     */
    public async getText(docxFile: Binary, relType: string = RelType.MainDocument): Promise<string> {
        const parts = await this.getParts(docxFile, relType);
        const partsText = await Promise.all(parts.map(p => p.getText()));
        return partsText.join('\n\n');
    }

    /**
     * Get the xml root of a single part of the document.
     * If no matching part is found, returns null.
     *
     * @param relType
     * The relationship type of the parts whose xml root you want to retrieve.
     * If more than one part exists, the first one is returned.
     * Defaults to `RelType.MainDocument`.
     */
    public async getXml(docxFile: Binary, relType: string = RelType.MainDocument): Promise<XmlNode> {
        const docx = await Docx.load(docxFile);

        if (relType === RelType.MainDocument) {
            return await docx.mainDocument.xmlRoot();
        }

        const part = await docx.mainDocument.getFirstPartByType(relType);
        if (!part) {
            return null;
        }
        return await part.xmlRoot();
    }

    public async getParts(docxFile: Binary, relType: string): Promise<OpenXmlPart[]> {
        const docx = await Docx.load(docxFile);

        if (relType === RelType.MainDocument) {
            return [docx.mainDocument];
        }

        const parts = await docx.mainDocument.getPartsByType(relType);
        return parts;
    }

    //
    // private methods
    //

    private async callExtensions(extensions: TemplateExtension[], scopeData: ScopeData, context: TemplateContext): Promise<void> {
        if (!extensions)
            return;

        for (const extension of extensions) {
            await extension.execute(scopeData, context);
        }
    }
}
