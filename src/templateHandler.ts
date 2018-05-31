import * as JSZip from 'jszip';
import { UnsupportedFileTypeError } from './errors';
import { FileType } from './fileType';
import { DocxTemplateSpec, ITemplateSpec } from './templateSpec';
import { IMap } from './types';
import { XmlParser } from './xmlParser';

export class TemplateHandler {

    private readonly templateSpec = new DocxTemplateSpec();
    private readonly parser = new XmlParser();

    public async process(templateFile: Buffer | ArrayBuffer, data: any): Promise<JSZip> {

        // load the doc (zip) file
        const docFile = await this.loadDocx(templateFile);

        // extract content
        const contentDocuments = await this.parseContentDocuments(docFile, this.templateSpec);

        // process content
        const processJobs = Object.values(contentDocuments).map(contentDoc => this.processDocument(contentDoc, data));
        await Promise.all(processJobs);

        // update the doc file
        for (const file of Object.keys(contentDocuments)) {
            const processedFile = contentDocuments[file];
            docFile.file(file, processedFile.textContent, { createFolders: true });
        }

        // export
        return docFile;
    }

    public async getText(docxFile: Buffer | ArrayBuffer): Promise<string> {
        const zipFile = await this.loadDocx(docxFile);
        const mainXmlFile = this.templateSpec.mainFilePath(zipFile);
        const xmlContent = await zipFile.files[mainXmlFile].async('text');
        const document = this.parser.parse(xmlContent);
        return this.parser.textContent(document);
    }

    private async loadDocx(file: Buffer | ArrayBuffer): Promise<JSZip> {
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
            contentDocuments[file] = this.parser.parse(textContent);
        }

        return contentDocuments;
    }

    private async processDocument(doc: Document, data: any): Promise<void> {
        await this.processNode(doc.documentElement, data);
    }

    private async processNode(node: Node, data: any): Promise<void> {
        if (!node)
            return;

        // process self
        // if (this.templateSpec. node.localName) {

        // }

        // process child nodes
        const childJobs: Promise<void>[] = [];
        const childNodesLength = (node.childNodes ? node.childNodes.length : 0);
        for (let i = 0; i < childNodesLength; i++) {
            childJobs.push(this.processNode(node.childNodes.item(i), data));
        }

        await Promise.all(childJobs);
    }
}