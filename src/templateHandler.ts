import { DelimiterSearcher, ScopeData, Tag, TagParser, TemplateCompiler, TemplateContext } from './compilation';
import { Delimiters } from './delimiters';
import { MalformedFileError } from './errors';
import { TemplateExtension } from './extensions';
import { ContentPartType, Docx, DocxParser } from './office';
import { TemplateData } from './templateData';
import { TemplateHandlerOptions } from './templateHandlerOptions';
import { Constructor } from './types';
import { Binary } from './utils';
import { XmlNode, XmlParser } from './xml';
import { Zip } from './zip';

export class TemplateHandler {

    /**
     * Version number of the `easy-template-x` library.
     */
    public readonly version = (typeof EASY_VERSION !== 'undefined' ? EASY_VERSION : 'null');

    private readonly xmlParser = new XmlParser();
    private readonly docxParser: DocxParser;
    private readonly compiler: TemplateCompiler;

    private readonly options: TemplateHandlerOptions;

    constructor(options?: TemplateHandlerOptions) {
        this.options = new TemplateHandlerOptions(options);

        //
        // this is the library's composition root
        //

        this.docxParser = new DocxParser(this.xmlParser);

        const delimiterSearcher = new DelimiterSearcher(this.docxParser);
        delimiterSearcher.startDelimiter = this.options.delimiters.tagStart;
        delimiterSearcher.endDelimiter = this.options.delimiters.tagEnd;
        delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;

        const tagParser = new TagParser(this.docxParser, this.options.delimiters as Delimiters);

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
                xmlParser: this.xmlParser,
                docxParser: this.docxParser,
                compiler: this.compiler
            });
        });

        const extensionUtilities = {
            xmlParser: this.xmlParser,
            docxParser: this.docxParser,
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
        const docx = await this.loadDocx(templateFile);

        // prepare context
        const scopeData = new ScopeData(data);
        scopeData.scopeDataResolver = this.options.scopeDataResolver;
        const context: TemplateContext = {
            docx,
            currentPart: null
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
        return docx.export(templateFile.constructor as Constructor<T>);
    }

    /**
     * Get the text content of a single part of the document.
     * If the part does not exists returns null.
     *
     * @param contentPart
     * The content part of which to get it's text content.
     * Defaults to `ContentPartType.MainDocument`.
     */
    public async parseTags(templateFile: Binary, contentPart = ContentPartType.MainDocument): Promise<Tag[]> {
        const docx = await this.loadDocx(templateFile);
        const part = await docx.getContentPart(contentPart);
        const xmlRoot = await part.xmlRoot();
        return this.compiler.parseTags(xmlRoot);
    }

    /**
     * Get the text content of a single part of the document.
     * If the part does not exists returns null.
     *
     * @param contentPart
     * The content part of which to get it's text content.
     * Defaults to `ContentPartType.MainDocument`.
     */
    public async getText(docxFile: Binary, contentPart = ContentPartType.MainDocument): Promise<string> {
        const docx = await this.loadDocx(docxFile);
        const part = await docx.getContentPart(contentPart);
        const text = await part.getText();
        return text;
    }

    /**
     * Get the xml root of a single part of the document.
     * If the part does not exists returns null.
     *
     * @param contentPart
     * The content part of which to get it's text content.
     * Defaults to `ContentPartType.MainDocument`.
     */
    public async getXml(docxFile: Binary, contentPart = ContentPartType.MainDocument): Promise<XmlNode> {
        const docx = await this.loadDocx(docxFile);
        const part = await docx.getContentPart(contentPart);
        const xmlRoot = await part.xmlRoot();
        return xmlRoot;
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

    private async loadDocx(file: Binary): Promise<Docx> {

        // load the zip file
        let zip: Zip;
        try {
            zip = await Zip.load(file);
        } catch {
            throw new MalformedFileError('docx');
        }

        // load the docx file
        const docx = await this.docxParser.load(zip);
        return docx;
    }
}
