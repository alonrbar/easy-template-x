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
        const docFile = await JSZip.loadAsync(templateFile);
        const fileType = FileType.getFileType(docFile);
        if (fileType !== FileType.Docx)
            throw new UnsupportedFileTypeError(fileType);

        // extract content
        const contentDocuments = await this.parseContentDocuments(docFile, this.templateSpec);

        // process content
        const processJobs = Object.values(contentDocuments).map(contentDoc => this.processDocument(contentDoc));
        await Promise.all(processJobs);

        // update the doc file
        for (const file of Object.keys(contentDocuments)) {
            const processedFile = contentDocuments[file];
            docFile.file(file, processedFile.textContent, { createFolders: true });
        }

        // export
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

    private async processDocument(doc: Document): Promise<void> {
        throw new Error("Method not implemented.");
    }
}