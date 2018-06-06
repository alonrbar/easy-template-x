import * as JSZip from 'jszip';
import { TemplateCompiler } from './compilation/templateCompiler';
import { DocxParser } from './docxParser';
import { UnsupportedFileTypeError } from './errors';
import { FileType } from './fileType';
import { Binary, IMap } from './utils';
import { XmlParser } from './xmlParser';

export class TemplateHandler {

    private readonly docxParser = new DocxParser();
    private readonly xmlParser = new XmlParser();
    private readonly compiler = new TemplateCompiler();

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
        const document = this.xmlParser.parse(xmlContent);
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
    private async parseContentDocuments(docFile: JSZip): Promise<IMap<Document>> {

        const contentFiles = this.docxParser.contentFilePaths(docFile);

        // some content files may not always exist (footer.xml for example)
        const existingContentFiles = contentFiles.filter(file => docFile.files[file]);

        const contentDocuments: IMap<Document> = {};
        for (const file of existingContentFiles) {

            // extract the content from the content file
            const textContent = await docFile.files[file].async('text');

            // parse the content as xml
            contentDocuments[file] = this.xmlParser.parse(textContent);
        }

        return contentDocuments;
    }
}