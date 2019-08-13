import * as JSZip from 'jszip';
import { MalformedFileError } from '../errors';
import { MimeType, MimeTypeHelper } from '../mimeType';
import { Binary, Constructor, Path } from '../utils';
import { XmlNode, XmlParser } from '../xml';
// import { Relationship } from './relationship';

export class Docx {

    public get documentPath(): string {

        if (!this._documentPath) {

            if (this.zip.files["word/document.xml"]) {
                this._documentPath = "word/document.xml";
            }

            // https://github.com/open-xml-templating/docxtemplater/issues/366
            else if (this.zip.files["word/document2.xml"]) {
                this._documentPath = "word/document2.xml";
            }
        }

        return this._documentPath;
    }

    // private contentTypes: any;

    // private documentRels: Relationship[];

    private _documentPath: string;

    private _document: XmlNode;

    constructor(
        private readonly zip: JSZip,
        private readonly xmlParser: XmlParser
    ) {
        if (!this.documentPath)
            throw new MalformedFileError('docx');
    }

    //
    // public methods
    //

    /**
     * The xml root of the main document file.
     */
    public async getDocument(): Promise<XmlNode> {
        if (!this._document) {
            const xml = await this.zip.files[this.documentPath].async('text');
            this._document = this.xmlParser.parse(xml);
        }
        return this._document;
    }

    /**
     * Get the text content of the main document file.
     */
    public async getDocumentText(): Promise<string> {
        const xmlDocument = await this.getDocument();

        // ugly but good enough...
        const xml = this.xmlParser.serialize(xmlDocument);
        const domDocument = this.xmlParser.domParse(xml);

        return domDocument.documentElement.textContent;
    }
    
    /**
     * Add a media resource to the document archive and return the created rel ID.
     */
    public addMedia(content: Binary, type: MimeType): string {

        const mediaFileRelPath = this.addMediaFileToZip(content, type);
        const relId = this.addRelsEntry(this.documentPath, mediaFileRelPath, type);
        return relId;
    }

    public async export<T extends Binary>(outputType: Constructor<T>): Promise<T> {
        await this.saveChanges();
        const zipOutputType: JSZip.OutputType = Binary.toJsZipOutputType(outputType);
        const output = await this.zip.generateAsync({ type: zipOutputType });
        return output as T;
    }    

    //
    // private methods
    //    

    /**
     * Returns the media file path relative to the document file.
     */
    private addMediaFileToZip(mediaFile: Binary, mime: MimeType): string {

        const mediaDirPath = `word/media`;
        const extension = MimeTypeHelper.getDefaultExtension(mime);

        // generate unique media file name
        const filenames = this.zip.folder(mediaDirPath).files;
        let num = 0;
        let filename = '';
        do {
            num++;
            filename = `media${num}.${extension}`;
        } while (filenames[filename]);

        // add media
        this.zip.folder(mediaDirPath).file(filename, mediaFile);

        return `media/${filename}`;
    }

    private addRelsEntry(documentPath: string, relTarget: string, mime: MimeType): string {

        const documentDir = Path.getDirectory(documentPath);
        const documentFilename = Path.getFilename(documentPath);
        const relsFilePath = `${documentDir}/_rels/${documentFilename}.rels`;

        let relsRoot: XmlNode;
        let relsFile = this.zip.file(relsFilePath);
        if (relsFile) {
            const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  </Relationships>`;
            relsRoot = this.xmlParser.parse(relsXml);
        }

        const relId = 'rId4';

        const relType = MimeTypeHelper.getOfficeRelType(mime);
        const entry = XmlNode.createGeneralNode('Relationship');
        entry.attributes = [
            { name: "Id", value: relId },
            { name: "Type", value: relType },
            { name: "Target", value: relTarget }
        ];

        relsRoot.childNodes.push(entry);

        return relId;
    }

    private async saveChanges() {
        const document = await this.getDocument();
        const xmlContent = this.xmlParser.serialize(document);
        this.zip.file(this.documentPath, xmlContent);
    }
}