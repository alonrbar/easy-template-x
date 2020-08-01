import { MalformedFileError } from '../errors';
import { Constructor } from '../types';
import { Binary, last } from '../utils';
import { XmlGeneralNode, XmlNodeType, XmlParser } from '../xml';
import { Zip } from '../zip';
import { ContentPartType } from './contentPartType';
import { ContentTypesFile } from './contentTypesFile';
import { MediaFiles } from './mediaFiles';
import { Rels } from './rels';
import { XmlPart } from './xmlPart';

/**
 * Represents a single docx file.
 */
export class Docx {

    private static readonly mainDocumentRelType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument';
    private static readonly headerRelType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header';
    private static readonly footerRelType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer';

    //
    // static methods
    //

    public static async open(zip: Zip, xmlParser: XmlParser): Promise<Docx> {
        const mainDocumentPath = await Docx.getMainDocumentPath(zip, xmlParser);
        if (!mainDocumentPath)
            throw new MalformedFileError('docx');

        return new Docx(mainDocumentPath, zip, xmlParser);
    }

    private static async getMainDocumentPath(zip: Zip, xmlParser: XmlParser): Promise<string> {
        const rootPart = '';
        const rootRels = new Rels(rootPart, zip, xmlParser);
        const relations = await rootRels.list();
        return relations.find(rel => rel.type == Docx.mainDocumentRelType)?.target;
    }

    //
    // fields
    //

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

    //
    // constructor
    //

    private constructor(
        mainDocumentPath: string,
        private readonly zip: Zip,
        private readonly xmlParser: XmlParser
    ) {
        this.mainDocument = new XmlPart(mainDocumentPath, zip, xmlParser);
        this.mediaFiles = new MediaFiles(zip);
        this.contentTypes = new ContentTypesFile(zip, xmlParser);
    }

    //
    // public methods
    //

    public async getContentPart(type: ContentPartType): Promise<XmlPart> {
        switch (type) {
            case ContentPartType.MainDocument:
                return this.mainDocument;
            default:
                return await this.getHeaderOrFooter(type);
        }
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

    private async getHeaderOrFooter(type: ContentPartType): Promise<XmlPart> {

        const nodeName = this.headerFooterNodeName(type);
        const nodeTypeAttribute = this.headerFooterType(type);

        // find the last section properties
        // see: http://officeopenxml.com/WPsection.php
        const docRoot = await this.mainDocument.xmlRoot();
        const body = docRoot.childNodes[0];
        const sectionProps = last(body.childNodes.filter(node => node.nodeType === XmlNodeType.General));
        if (sectionProps.nodeName != 'w:sectPr')
            return null;

        // find header or footer reference
        const reference = sectionProps.childNodes?.find(node => {
            return node.nodeType === XmlNodeType.General &&
                node.nodeName === nodeName &&
                node.attributes?.['w:type'] === nodeTypeAttribute;
        });
        const relId = (reference as XmlGeneralNode)?.attributes?.['r:id'];
        if (!relId)
            return null;

        // create XmlPart
        const rels = await this.mainDocument.rels.list();
        const partRel = rels.find(r => r.id === relId);
        return new XmlPart("word/" + partRel.target, this.zip, this.xmlParser);
    }

    private headerFooterNodeName(contentPartType: ContentPartType): string {
        switch (contentPartType) {

            case ContentPartType.DefaultHeader:
            case ContentPartType.FirstHeader:
            case ContentPartType.EvenPagesHeader:
                return 'w:headerReference';

            case ContentPartType.DefaultFooter:
            case ContentPartType.FirstFooter:
            case ContentPartType.EvenPagesFooter:
                return 'w:footerReference';

            default:
                throw new Error(`Invalid content part type: '${contentPartType}'.`);
        }
    }

    private headerFooterType(contentPartType: ContentPartType): string {

        // https://docs.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing.headerfootervalues?view=openxml-2.8.1

        switch (contentPartType) {

            case ContentPartType.DefaultHeader:
            case ContentPartType.DefaultFooter:
                return 'default';

            case ContentPartType.FirstHeader:
            case ContentPartType.FirstFooter:
                return 'first';

            case ContentPartType.EvenPagesHeader:
            case ContentPartType.EvenPagesFooter:
                return 'even';

            default:
                throw new Error(`Invalid content part type: '${contentPartType}'.`);
        }
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
