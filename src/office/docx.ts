import { MalformedFileError } from "src/errors";
import { Constructor } from "src/types";
import { Binary } from "src/utils";
import { Zip } from "src/zip";
import { ContentTypesFile } from "./contentTypesFile";
import { MediaFiles } from "./mediaFiles";
import { OpenXmlPart } from "./openXmlPart";
import { RelType } from "./relationship";
import { RelsFile } from "./relsFile";

/**
 * Represents a single docx file.
 */
export class Docx {

    /**
     * Load a docx file from a binary zip file.
     */
    public static async load(file: Binary): Promise<Docx> {

        // Load the zip file
        let zip: Zip;
        try {
            zip = await Zip.load(file);
        } catch {
            throw new MalformedFileError('docx');
        }

        // Load the docx file
        const docx = await Docx.open(zip);
        return docx;
    }

    /**
     * Open a docx file from an instantiated zip file.
     */
    public static async open(zip: Zip): Promise<Docx> {
        const mainDocumentPath = await Docx.getMainDocumentPath(zip);
        if (!mainDocumentPath)
            throw new MalformedFileError('docx');

        return new Docx(mainDocumentPath, zip);
    }

    private static async getMainDocumentPath(zip: Zip): Promise<string> {
        const rootPart = '';
        const rootRels = new RelsFile(rootPart, zip);
        const relations = await rootRels.list();
        return relations.find(rel => rel.type == RelType.MainDocument)?.target;
    }

    //
    // fields
    //

    public readonly mainDocument: OpenXmlPart;
    public readonly mediaFiles: MediaFiles;
    public readonly contentTypes: ContentTypesFile;

    private readonly zip: Zip;

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
        zip: Zip,
    ) {
        this.zip = zip;
        this.mainDocument = new OpenXmlPart(mainDocumentPath, zip);
        this.mediaFiles = new MediaFiles(zip);
        this.contentTypes = new ContentTypesFile(zip);
    }

    //
    // public methods
    //

    public async getContentParts(): Promise<OpenXmlPart[]> {

        const parts: OpenXmlPart[] = [
            this.mainDocument
        ];

        const relTypes = [
            RelType.Header,
            RelType.Footer,
            RelType.Chart
        ];
        for (const relType of relTypes) {
            const typeParts = await this.mainDocument.getPartsByType(relType);
            if (typeParts?.length) {
                parts.push(...typeParts);
            }
        }

        return parts;
    }

    public async export<T extends Binary>(outputType?: Constructor<T>): Promise<T> {
        await this.mainDocument.save();
        await this.contentTypes.save();
        return await this.zip.export(outputType);
    }
}
