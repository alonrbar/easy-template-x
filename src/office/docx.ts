import { MalformedFileError } from '../errors';
import { Constructor } from '../types';
import { Binary } from '../utils';
import { XmlNode, XmlParser } from '../xml';
import { Zip } from '../zip';
import { ContentTypesFile } from './contentTypesFile';
import { CustomXmlFiles } from './customXmlFiles';
import { MediaFiles } from './mediaFiles';
import { Rels } from './rels';

/**
 * Represents a single docx file.
 */
export class Docx {

    public get documentPath(): string {

        if (!this._documentPath) {

            if (this.zip.isFileExist("word/document.xml")) {
                this._documentPath = "word/document.xml";
            }

            // https://github.com/open-xml-templating/docxtemplater/issues/366
            else if (this.zip.isFileExist("word/document2.xml")) {
                this._documentPath = "word/document2.xml";
            }
        }

        return this._documentPath;
    }

    public readonly rels: Rels;
    public readonly mediaFiles: MediaFiles;
    public readonly contentTypes: ContentTypesFile;
    public readonly customXmlFiles: CustomXmlFiles;

    private _documentPath: string;
    private _document: XmlNode;

    constructor(
        private readonly zip: Zip,
        private readonly xmlParser: XmlParser
    ) {
        if (!this.documentPath)
            throw new MalformedFileError('docx');

        this.rels = new Rels(this.documentPath, zip, xmlParser);
        this.mediaFiles = new MediaFiles(zip);
        this.contentTypes = new ContentTypesFile(zip, xmlParser);
        this.customXmlFiles = new CustomXmlFiles(zip, xmlParser);
    }

    //
    // public methods
    //

    /**
     * The xml root of the main document file.
     */
    public async getDocument(): Promise<XmlNode> {
        if (!this._document) {
            const xml = await this.zip.getFile(this.documentPath).getContentText();
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

    public async export<T extends Binary>(outputType: Constructor<T>): Promise<T> {
        await this.saveChanges();
        return await this.zip.export(outputType);
    }

    public async getCustomXmlFiles(): Promise<Map<string, XmlNode>> {
        return await this.customXmlFiles.loadFiles();
    }

    //
    // private methods
    //

    private async saveChanges() {

        // save main document
        const document = await this.getDocument();
        const xmlContent = this.xmlParser.serialize(document);
        this.zip.setFile(this.documentPath, xmlContent);

        // save other parts
        await this.rels.save();
        await this.contentTypes.save();
        await this.customXmlFiles.save();
    }
}
