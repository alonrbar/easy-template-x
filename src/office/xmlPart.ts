import { XmlNode, XmlParser } from '../xml';
import { Zip } from '../zip';
import { Rels } from './rels';

/**
 * Represents an xml file that is part of an OPC package.
 *
 * See: https://en.wikipedia.org/wiki/Open_Packaging_Conventions
 */
export class XmlPart {

    public readonly rels: Rels;

    private root: XmlNode;

    constructor(
        public readonly path: string,
        private readonly zip: Zip,
        private readonly xmlParser: XmlParser
    ) {
        this.rels = new Rels(this.path, zip, xmlParser);
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
            const xml = await this.zip.getFile(this.path).getContentText();
            this.root = this.xmlParser.parse(xml);
        }
        return this.root;
    }

    /**
     * Get the text content of the part.
     */
    public async getText(): Promise<string> {
        const xmlDocument = await this.xmlRoot();

        // ugly but good enough...
        const xml = this.xmlParser.serialize(xmlDocument);
        const domDocument = this.xmlParser.domParse(xml);

        return domDocument.documentElement.textContent;
    }

    public async saveChanges(): Promise<void> {

        // save xml
        if (this.root) {
            const xmlRoot = await this.xmlRoot();
            const xmlContent = this.xmlParser.serialize(xmlRoot);
            this.zip.setFile(this.path, xmlContent);
        }

        // save rels
        await this.rels.save();
    }
}
