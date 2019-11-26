import { DelimiterSearcher, ScopeData, Tag, TagParser, TemplateCompiler, TemplateContext } from './compilation';
import { Delimiters } from './delimiters';
import { MalformedFileError } from './errors';
import { Docx, DocxParser } from './office';
import { TemplateHandlerOptions } from './templateHandlerOptions';
import { Binary, EASY_VERSION, Constructor } from './utils';
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
        let zip: Zip;
        try {
            zip = await Zip.load(file);
        } catch {
            throw new MalformedFileError('docx');
        }

        // load the docx file
        const docx = this.docxParser.load(zip);
        return docx;
    }
}