import * as JSZip from 'jszip';
import { DelimiterSearcher, TagParser, TemplateCompiler } from './compilation';
import { DocxParser } from './docxParser';
import { UnsupportedFileTypeError } from './errors';
import { FileType } from './fileType';
import { TemplateHandlerOptions } from './templateHandlerOptions';
import { Binary, IMap } from './utils';
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
        delimiterSearcher.startDelimiter = this.options.delimiters.start;
        delimiterSearcher.endDelimiter = this.options.delimiters.end;
        delimiterSearcher.maxXmlDepth = this.options.maxXmlDepth;

        const prefixes = this.options.plugins
            .map(plugin => plugin.prefixes)
            .reduce((total, current) => total.concat(current), []);

        const tagParser = new TagParser(prefixes, this.docxParser);
        tagParser.startDelimiter = this.options.delimiters.start;
        tagParser.endDelimiter = this.options.delimiters.end;

        this.compiler = new TemplateCompiler(
            delimiterSearcher,
            tagParser,
            this.options.plugins
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
        for (const contentDoc of Object.values(contentDocuments)) {
            this.compiler.compile(contentDoc, data);
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

    public async getText(docxFile: Binary): Promise<string> {
        const zipFile = await this.loadDocx(docxFile);
        const mainXmlFile = this.docxParser.mainFilePath(zipFile);
        const xmlContent = await zipFile.files[mainXmlFile].async('text');
        const document = this.xmlParser.domParse(xmlContent);
        return document.documentElement.textContent;
    }

    //
    // private methods
    //

    private async loadDocx(file: Binary): Promise<JSZip> {
        const docFile = await JSZip.loadAsync(file);
        const fileType = FileType.getFileType(docFile);
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
}