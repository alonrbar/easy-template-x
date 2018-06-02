import * as JSZip from 'jszip';
import { TemplateCompiler } from './compilation/templateCompiler';
import { UnsupportedFileTypeError } from './errors';
import { FileType } from './fileType';
import { DocxTemplateSpec, ITemplateSpec } from './templateSpec';
import { Binary, IMap } from './utils';
import { XmlParser } from './xmlParser';

export class TemplateHandler {

    private readonly templateSpec = new DocxTemplateSpec();
    private readonly xmlParser = new XmlParser();
    private readonly compiler = new TemplateCompiler();

    public async process<T extends Binary>(templateFile: T, data: any): Promise<T> {

        // load the doc (zip) file
        const docFile = await this.loadDocx(templateFile);

        // extract content as xml documents
        const contentDocuments = await this.parseContentDocuments(docFile, this.templateSpec);

        // process content (do replacements)
        for (const contentDoc of Object.values(contentDocuments)) {
            this.compiler.compile(contentDoc, data);
        }

        // update the doc file
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
        const mainXmlFile = this.templateSpec.mainFilePath(zipFile);
        const xmlContent = await zipFile.files[mainXmlFile].async('text');
        const document = this.xmlParser.parse(xmlContent);
        return this.xmlParser.textContent(document);
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

    private async parseContentDocuments(docFile: JSZip, templateSpec: ITemplateSpec): Promise<IMap<Document>> {

        const contentFiles = templateSpec.contentFilePaths(docFile);

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