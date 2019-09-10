import * as JSZip from 'jszip';
import { DelimiterSearcher, ScopeData, Tag, TagParser, TemplateCompiler, TemplateContext } from './compilation';
import { MalformedFileError } from './errors';
import { Docx, DocxParser } from './office';
import { TemplateHandlerOptions } from './templateHandlerOptions';
import { Binary } from './utils';
import { XmlNode, XmlParser } from './xml';

export class TemplateHandler {

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

        const delimiterSearcher = new DelimiterSearcher();
        delimiterSearcher.startDelimiter = this.options.delimiters.tagStart;
        delimiterSearcher.endDelimiter = this.options.delimiters.tagEnd;
        delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;

        const tagParser = new TagParser(this.docxParser, this.options.delimiters);

        this.compiler = new TemplateCompiler(
            delimiterSearcher,
            tagParser,
            this.options.plugins,
            this.options.defaultContentType,
            this.options.containerContentType
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

        // load the docx file
        const docx = await this.loadDocx(templateFile);
        const document = await docx.getDocument();

        // process content (do replacements)        
        const scopeData = new ScopeData(data);
        const context: TemplateContext = {
            docx
        };
        await this.compiler.compile(document, scopeData, context);

        // export the result
        return docx.export(templateFile.constructor as Constructor<T>);
    }

    public async parseTags(templateFile: Binary): Promise<Tag[]> {
        const docx = await this.loadDocx(templateFile);
        const document = await docx.getDocument();
        return this.compiler.parseTags(document);
    }

    /**
     * Get the text content of the main document file.
     */
    public async getText(docxFile: Binary): Promise<string> {
        const docx = await this.loadDocx(docxFile);
        const text = await docx.getDocumentText();
        return text;
    }

    /**
     * Get the xml tree of the main document file.
     */
    public async getXml(docxFile: Binary): Promise<XmlNode> {
        const docx = await this.loadDocx(docxFile);
        const document = await docx.getDocument();
        return document;
    }

    //
    // private methods
    //

    private async loadDocx(file: Binary): Promise<Docx> {

        // load the zip file
        let zip: JSZip;
        try {
            zip = await JSZip.loadAsync(file);
        } catch {
            throw new MalformedFileError('docx');
        }

        // load the docx file
        const docx = this.docxParser.load(zip);
        return docx;
    }    
}