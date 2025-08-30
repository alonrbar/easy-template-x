import { MimeType, MimeTypeHelper } from "src/mimeType";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { Zip } from "src/zip";

/**
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class ContentTypesFile {

    private static readonly contentTypesFilePath = '[Content_Types].xml';

    private addedNew = false;

    private root: XmlNode;

    private contentTypes: Partial<Record<string, MimeType>>;

    private readonly zip: Zip;

    constructor(zip: Zip) {
        this.zip = zip;
    }

    public async ensureContentType(mime: MimeType): Promise<void> {

        // Parse the content types file
        await this.parseContentTypesFile();

        // Extension already exists
        //
        // Multiple extensions may map to the same mime type, but a single
        // extension must only map to one mime type.
        const extension = MimeTypeHelper.getDefaultExtension(mime);
        if (this.contentTypes[extension])
            return;

        // Add new node
        const typeNode = xml.create.generalNode('Default');
        typeNode.attributes = {
            "Extension": extension,
            "ContentType": mime
        };
        this.root.childNodes.push(typeNode);

        // Update state
        this.addedNew = true;
        this.contentTypes[extension] = mime;
    }

    public async xmlString(): Promise<string> {
        await this.parseContentTypesFile();
        return xml.parser.serializeFile(this.root);
    }

    /**
     * Save the Content Types file back to the zip.
     * Called automatically by the holding `Docx` before exporting.
     */
    public async save(): Promise<void> {

        // Not change - no need to save
        if (!this.addedNew)
            return;

        const xmlContent = xml.parser.serializeFile(this.root);
        this.zip.setFile(ContentTypesFile.contentTypesFilePath, xmlContent);
    }

    private async parseContentTypesFile(): Promise<void> {
        if (this.root)
            return;

        // parse the xml file
        const contentTypesXml = await this.zip.getFile(ContentTypesFile.contentTypesFilePath).getContentText();
        this.root = xml.parser.parse(contentTypesXml);

        // build the content types lookup
        this.contentTypes = {};
        for (const node of this.root.childNodes) {

            if (node.nodeName !== 'Default')
                continue;

            const genNode = (node as XmlGeneralNode);
            const contentTypeAttribute = genNode.attributes['ContentType'] as MimeType;
            if (!contentTypeAttribute)
                continue;

            const extensionAttribute = genNode.attributes['Extension'];
            if (!extensionAttribute)
                continue;

            this.contentTypes[extensionAttribute] = contentTypeAttribute;
        }
    }
}
