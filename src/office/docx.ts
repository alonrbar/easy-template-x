import { MalformedFileError } from '../errors';
import { Constructor } from '../types';
import { Binary } from '../utils';
import { XmlParser } from '../xml';
import { Zip } from '../zip';
import { ContentPartType } from './contentPartType';
import { ContentTypesFile } from './contentTypesFile';
import { MediaFiles } from './mediaFiles';
import { XmlPart } from './xmlPart';

/**
 * Represents a single docx file.
 */
export class Docx {

    private static readonly headerRelType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header';
    private static readonly footerRelType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer';

    public readonly mainDocument: XmlPart;
    public readonly mediaFiles: MediaFiles;
    public readonly contentTypes: ContentTypesFile;

    private _headers: XmlPart[];
    private _footers: XmlPart[];

    /**
     * **Notice:** You should only use this property if there is no other way to
     * do what you need. Use with caution.
     */
    public get rawZipFile(): Zip {
        return this.zip;
    }

    constructor(
        private readonly zip: Zip,
        private readonly xmlParser: XmlParser
    ) {
        const mainDocumentPath = this.getMainDocumentPath();
        if (!mainDocumentPath)
            throw new MalformedFileError('docx');

        this.mainDocument = new XmlPart(mainDocumentPath, zip, xmlParser);

        this.mediaFiles = new MediaFiles(zip);
        this.contentTypes = new ContentTypesFile(zip, xmlParser);
    }

    //
    // public methods
    //

    public async getContentPart(type: ContentPartType): Promise<XmlPart> {
        throw new Error("Not implemented");
    }

    /**
     * Returns the xml parts of the main document, headers and footers.
     */
    public async getContentParts(): Promise<XmlPart[]> {
        const headers = await this.getHeaders();
        const footers = await this.getFooters();
        return [
            this.mainDocument,
            ...headers,
            ...footers
        ];
    }

    public async getHeaders(): Promise<XmlPart[]> {
        if (this._headers)
            return this._headers;

        const rels = await this.mainDocument.rels.list();
        const headerRels = rels.filter(rel => rel.type === Docx.headerRelType);
        this._headers = headerRels.map(rel => new XmlPart("word/" + rel.target, this.zip, this.xmlParser));

        return this._headers;
    }

    public async getFooters(): Promise<XmlPart[]> {
        if (this._footers)
            return this._footers;

        const rels = await this.mainDocument.rels.list();
        const footerRels = rels.filter(rel => rel.type === Docx.footerRelType);
        this._footers = footerRels.map(rel => new XmlPart("word/" + rel.target, this.zip, this.xmlParser));

        return this._footers;
    }

    public async export<T extends Binary>(outputType: Constructor<T>): Promise<T> {
        await this.saveChanges();
        return await this.zip.export(outputType);
    }

    //
    // private methods
    //

    private getMainDocumentPath(): string {

        if (this.zip.isFileExist("word/document.xml"))
            return "word/document.xml";

        // https://github.com/open-xml-templating/docxtemplater/issues/366
        if (this.zip.isFileExist("word/document2.xml"))
            return "word/document2.xml";

        return null;
    }

    private async saveChanges() {

        const parts = [
            this.mainDocument,
            ...(this._headers || []),
            ...(this._footers || [])
        ];
        for (const part of parts) {
            await part.saveChanges();
        }

        await this.contentTypes.save();
    }
}
