import { MalformedFileError } from "src/errors";
import { Constructor, IMap } from "src/types";
import { Binary } from "src/utils";
import { Zip } from "src/zip";
import { OpenXmlPart } from "./openXmlPart";
import { RelType } from "./relationship";
import { RelsFile } from "./relsFile";

/**
 * Represents a single xlsx file.
 */
export class Xlsx {

    /**
     * Load an xlsx file from a binary zip file.
     */
    public static async load(file: Binary): Promise<Xlsx> {

        // Load the zip file
        let zip: Zip;
        try {
            zip = await Zip.load(file);
        } catch {
            throw new MalformedFileError('xlsx');
        }

        // Load the xlsx file
        const xlsx = await Xlsx.open(zip);
        return xlsx;
    }

    /**
     * Open an xlsx file from an instantiated zip file.
     */
    public static async open(zip: Zip): Promise<Xlsx> {
        const mainDocumentPath = await Xlsx.getMainDocumentPath(zip);
        if (!mainDocumentPath)
            throw new MalformedFileError('xlsx');

        return new Xlsx(mainDocumentPath, zip);
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

    private readonly _parts: IMap<OpenXmlPart> = {};

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
    }

    //
    // public methods
    //

    public async export<T extends Binary>(outputType?: Constructor<T>): Promise<T> {
        await this.saveXmlChanges();
        return await this.zip.export(outputType);
    }

    //
    // private methods
    //

    private async saveXmlChanges() {

        const parts = [
            this.mainDocument,
            ...Object.values(this._parts)
        ];
        for (const part of parts) {
            await part.save();
        }
    }
}
