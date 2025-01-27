import { MalformedFileError } from '../errors';
import { Constructor, IMap } from '../types';
import { Binary, last } from '../utils';
import { XmlGeneralNode, XmlNodeType, XmlParser } from '../xml';
import { Zip } from '../zip';
import { ContentPartType } from './contentPartType';
import { ContentTypesFile } from './contentTypesFile';
import { MediaFiles } from './mediaFiles';
import { RelType } from "./relationship";
import { RelsFile } from './relsFile';
import { XmlPart } from './xmlPart';

/**
 * Represents a single docx file.
 */
export class Docx {

    public static async open(zip: Zip, xmlParser: XmlParser): Promise<Docx> {
        const mainDocumentPath = await Docx.getMainDocumentPath(zip, xmlParser);
        if (!mainDocumentPath)
            throw new MalformedFileError('docx');

        return new Docx(mainDocumentPath, zip, xmlParser);
    }

    private static async getMainDocumentPath(zip: Zip, xmlParser: XmlParser): Promise<string> {
        const rootPart = '';
        const rootRels = new RelsFile(rootPart, zip, xmlParser);
        const relations = await rootRels.list();
        return relations.find(rel => rel.type == RelType.MainDocument)?.target;
    }

    //
    // fields
    //

    public readonly mainDocument: XmlPart;
    public readonly mediaFiles: MediaFiles;
    public readonly contentTypes: ContentTypesFile;

    private readonly _parts: IMap<XmlPart> = {};

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
        const partTypes = [
            ContentPartType.MainDocument,
            ContentPartType.DefaultHeader,
            ContentPartType.FirstHeader,
            ContentPartType.EvenPagesHeader,
            ContentPartType.DefaultFooter,
            ContentPartType.FirstFooter,
            ContentPartType.EvenPagesFooter
        ];
        const parts: XmlPart[] = [];
        for (const partType of partTypes) {
            const part = await this.getContentPart(partType);
            if (part) {
                parts.push(part);
            }
        }
        return parts;
    }

    public async export<T extends Binary>(outputType: Constructor<T>): Promise<T> {
        await this.saveChanges();
        return await this.zip.export(outputType);
    }

    //
    // private methods
    //

    private async getHeaderOrFooter(type: ContentPartType): Promise<XmlPart> {

        // Find all section properties (http://officeopenxml.com/WPsection.php)
        const docRoot = await this.mainDocument.xmlRoot();
        const sectionProps = this.allSectionProperties(docRoot as XmlGeneralNode);
        if (!sectionProps?.length) {
            return null;
        }

        // Find the header or footer reference
        const nodeName = this.headerFooterNodeName(type);
        const nodeTypeAttribute = this.headerFooterType(type);
        const reference = sectionProps.map(secPr => secPr.childNodes ?? []).flat().find(node => {
            return node.nodeType === XmlNodeType.General &&
                node.nodeName === nodeName &&
                node.attributes?.['w:type'] === nodeTypeAttribute;
        });
        const relId = (reference as XmlGeneralNode)?.attributes?.['r:id'];
        if (!relId)
            return null;

        // return the XmlPart
        const rels = await this.mainDocument.rels.list();
        const relTarget = rels.find(r => r.id === relId).target;
        if (!this._parts[relTarget]) {
            const partPath = relTarget.startsWith('word/') ? relTarget : "word/" + relTarget;
            const part = new XmlPart(partPath, this.zip, this.xmlParser);
            this._parts[relTarget] = part;
        }
        return this._parts[relTarget];
    }

    private headerFooterNodeName(contentPartType: ContentPartType) {
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

    private headerFooterType(contentPartType: ContentPartType) {

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
            ...Object.values(this._parts)
        ];
        for (const part of parts) {
            await part.saveChanges();
        }

        await this.contentTypes.save();
    }

    private allSectionProperties(docRoot: XmlGeneralNode): XmlGeneralNode[] {
        const body = docRoot.childNodes.find(node => node.nodeName == 'w:body');
        if (!body) {
            return null;
        }

        //
        // http://officeopenxml.com/WPsection.php:
        //
        // For all sections except the last section, the sectPr element is
        // stored as a child element of the last paragraph in the section. For
        // the last section, the sectPr is stored as a child element of the body
        // element.
        //

        const sectionProps: XmlGeneralNode[] = [];

        // All sections but the last section
        for (const node of (body.childNodes ?? [])) {

            // Traverse paragraphs
            if (node.nodeName !== 'w:p') {
                continue;
            }

            // Find paragraph properties
            const pPr = node.childNodes?.find(child => child.nodeName === 'w:pPr');
            if (!pPr) {
                continue;
            }

            // Find section properties
            const sectPr = pPr.childNodes?.find(child => child.nodeName === 'w:sectPr');
            if (!sectPr) {
                continue;
            }

            sectionProps.push(sectPr as XmlGeneralNode);
        }

        // The last section
        const lastSectionProps = last(body.childNodes.filter(node => node.nodeName === 'w:sectPr'));
        if (lastSectionProps) {
            sectionProps.push(lastSectionProps as XmlGeneralNode);
        }

        return sectionProps;
    }
}
