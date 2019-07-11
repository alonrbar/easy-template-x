import * as JSZip from 'jszip';
import { DelimiterSearcher, ScopeData, Tag, TagParser, TemplateCompiler, TemplateContext } from './compilation';
import { DocxParser } from './docxParser';
import { MalformedFileError, UnsupportedFileTypeError } from './errors';
import { FileType, FileTypeHelper } from './fileType';
import { TemplateHandlerOptions } from './templateHandlerOptions';
import { Binary, IMap, pushMany } from './utils';
import { XmlNode } from './xmlNode';
import { XmlParser } from './xmlParser';

export class TemplateHandler {

    private readonly docxParser = new DocxParser();
    private readonly xmlParser = new XmlParser();
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

        const tagParser = new TagParser(this.docxParser, this.options.delimiters);

        this.compiler = new TemplateCompiler(
            delimiterSearcher,
            tagParser,
            this.options.plugins,
            this.options.defaultPlugin,
            this.options.containerPlugin
        );

        this.options.plugins.forEach(plugin => {
            plugin.setUtilities({
                xmlParser: this.xmlParser,
                docxParser: this.docxParser,
                compiler: this.compiler
            });
        });
    }

    public async process<T extends Binary>(templateFile: T, data: any): Promise<T> {

        // load the docx (zip) file
        const docFile = await this.loadDocx(templateFile);

        // extract content as xml documents
        const contentDocuments = await this.parseContentDocuments(docFile);

        // process content (do replacements)        
        const scopeData = new ScopeData(data);
        const context: TemplateContext = {
            zipFile: docFile,
            currentFilePath: null
        };
        for (const file of Object.keys(contentDocuments)) {
            context.currentFilePath = file;
            this.compiler.compile(contentDocuments[file], scopeData, context);
        }

        // update the docx file
        for (const file of Object.keys(contentDocuments)) {
            const processedFile = contentDocuments[file];
            const xmlContent = this.xmlParser.serialize(processedFile);
            docFile.file(file, xmlContent, { createFolders: true });
        }

        // export
        const outputType: JSZip.OutputType = Binary.toJsZipOutputType(templateFile);
        return docFile.generateAsync({ type: outputType }) as Promise<T>;
    }

    public async parseTags(templateFile: Binary): Promise<Tag[]> {

        // load the docx (zip) file
        const docFile = await this.loadDocx(templateFile);

        // extract content as xml documents
        const contentDocuments = await this.parseContentDocuments(docFile);

        // parse tags
        const tags: Tag[] = [];
        for (const file of Object.keys(contentDocuments)) {
            const docTags = this.compiler.parseTags(contentDocuments[file]);
            pushMany(tags, docTags);
        }

        return tags;
    }

    /**
     * Get the text content of the main document file.
     */
    public async getText(docxFile: Binary): Promise<string> {
        const root = await this.getDomRoot(docxFile);
        return root.textContent;
    }

    /**
     * Get the xml tree of the main document file.
     */
    public async getXml(docxFile: Binary): Promise<XmlNode> {
        const root = await this.getDomRoot(docxFile);
        return XmlNode.fromDomNode(root);
    }

    //
    // private methods
    //

    private async loadDocx(file: Binary): Promise<JSZip> {
        
        // load the zip file
        let docFile: JSZip;
        try {
            docFile = await JSZip.loadAsync(file);
        } catch {
            throw new MalformedFileError('docx');
        }

        // verify it's a docx file
        const fileType = FileTypeHelper.getFileType(docFile);
        if (fileType !== FileType.Docx)
            throw new UnsupportedFileTypeError(fileType);

        return docFile;
    }

    /**
     * Returns a map where the key is the **file path** and the value is a **parsed document**.
     */
    private async parseContentDocuments(docFile: JSZip): Promise<IMap<XmlNode>> {

        const contentFiles = this.docxParser.contentFilePaths(docFile);

        // some content files may not always exist (footer.xml for example)
        const existingContentFiles = contentFiles.filter(file => docFile.files[file]);

        const contentDocuments: IMap<XmlNode> = {};
        for (const file of existingContentFiles) {

            // extract the content from the content file
            const textContent = await docFile.files[file].async('text');

            // parse the content as xml
            contentDocuments[file] = this.xmlParser.parse(textContent);
        }

        return contentDocuments;
    }

    private async getDomRoot(docxFile: Binary): Promise<Node> {
        const zipFile = await this.loadDocx(docxFile);
        const mainXmlFile = this.docxParser.mainFilePath(zipFile);
        const xmlContent = await zipFile.files[mainXmlFile].async('text');
        const document = this.xmlParser.domParse(xmlContent);
        return document.documentElement;
    }
}