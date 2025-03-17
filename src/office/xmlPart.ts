import { xml, XmlNode } from "src/xml";
import { Zip } from "src/zip";
import { RelsFile } from "./relsFile";

/**
 * Represents an xml file that is part of an OPC package.
 *
 * See: https://en.wikipedia.org/wiki/Open_Packaging_Conventions
 */
export class XmlPart {

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

    public async saveChanges(): Promise<void> {

        // save xml
        if (this.root) {
            const xmlRoot = await this.xmlRoot();
            const xmlContent = xml.parser.serializeFile(xmlRoot);
            this.zip.setFile(this.path, xmlContent);
        }

        // save rels
        await this.rels.save();
    }
}
