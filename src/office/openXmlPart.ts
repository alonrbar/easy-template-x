import { Constructor } from "src/types";
import { Binary } from "src/utils";
import { xml, XmlNode } from "src/xml";
import { Zip } from "src/zip";
import { RelsFile } from "./relsFile";

/**
 * Represents an OpenXml package part.
 *
 * Most common parts are xml files, but it can also be any other arbitrary file.
 *
 * See: https://en.wikipedia.org/wiki/Open_Packaging_Conventions
 */
export class OpenXmlPart {

    public readonly rels: RelsFile;
    public readonly path: string;

    private root: XmlNode;

    private readonly zip: Zip;

    constructor(path: string, zip: Zip) {
        this.path = path;
        this.zip = zip;
        this.rels = new RelsFile(this.path, zip);
    }

    //
    // public methods
    //

    /**
     * Get the xml root node of the part.
     * Changes to the xml will be persisted to the underlying zip file.
     */
    public async xmlRoot(): Promise<XmlNode> {
        if (!this.root) {
            const file = this.zip.getFile(this.path);
            const xmlString = await file.getContentText();
            this.root = xml.parser.parse(xmlString);
        }
        return this.root;
    }

    /**
     * Get the text content of the part.
     */
    public async getText(): Promise<string> {
        const xmlDocument = await this.xmlRoot();

        // ugly but good enough...
        const xmlString = xml.parser.serializeFile(xmlDocument);
        const domDocument = xml.parser.domParse(xmlString);

        return domDocument.documentElement.textContent;
    }

    /**
     * Get the binary content of the part.
     */
    public async getContentBinary<T extends Binary>(outputType?: Constructor<T>): Promise<T> {
        const file = this.zip.getFile(this.path);
        return await file.getContentBinary(outputType);
    }

    /**
     * Get a related OpenXmlPart by the relationship ID.
     */
    public async getPartById(relId: string): Promise<OpenXmlPart> {
        const rels = await this.rels.list();
        const rel = rels.find(r => r.id === relId);
        if (!rel) {
            return null;
        }

        // TODO: Need to handle the relative path...
        const part = new OpenXmlPart(rel.target, this.zip);
        return part;
    }

    public async saveXmlChanges(): Promise<void> {

        // Save xml
        if (this.root) {
            const xmlRoot = await this.xmlRoot();
            const xmlContent = xml.parser.serializeFile(xmlRoot);
            this.zip.setFile(this.path, xmlContent);
        }

        // Save rels
        await this.rels.save();
    }

    public async saveBinaryChanges(newContent: Binary): Promise<void> {

        // Save binary
        this.zip.setFile(this.path, newContent);

        // Save rels
        await this.rels.save();
    }
}
