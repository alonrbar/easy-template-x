import { MimeType, MimeTypeHelper } from '../mimeType';
import { IMap } from '../types';
import { XmlGeneralNode, XmlNode, XmlParser } from '../xml';
import { Zip } from '../zip';

/**
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class ContentTypesFile {

    private static readonly contentTypesFilePath = '[Content_Types].xml';

    private addedNew = false;

    private root: XmlNode;

    private contentTypes: IMap<boolean>;

    constructor(
        private readonly zip: Zip,
        private readonly xmlParser: XmlParser
    ) {
    }

    public async ensureContentType(mime: MimeType): Promise<void> {

        // parse the content types file
        await this.parseContentTypesFile();

        // already exists
        if (this.contentTypes[mime])
            return;

        // add new
        const extension = MimeTypeHelper.getDefaultExtension(mime);
        const typeNode = XmlNode.createGeneralNode('Default');
        typeNode.attributes = {
            "Extension": extension,
            "ContentType": mime
        };
        this.root.childNodes.push(typeNode);

        // update state
        this.addedNew = true;
        this.contentTypes[mime] = true;
    }

    public async count(): Promise<number> {
        await this.parseContentTypesFile();
        return this.root.childNodes.filter(node => !XmlNode.isTextNode(node)).length;
    }

    /**
     * Save the Content Types file back to the zip.
     * Called automatically by the holding `Docx` before exporting.
     */
    public async save(): Promise<void> {

        // not change - no need to save
        if (!this.addedNew)
            return;

        const xmlContent = this.xmlParser.serialize(this.root);
        this.zip.setFile(ContentTypesFile.contentTypesFilePath, xmlContent);
    }

    private async parseContentTypesFile(): Promise<void> {
        if (this.root)
            return;

        // parse the xml file
        const contentTypesXml = await this.zip.getFile(ContentTypesFile.contentTypesFilePath).getContentText();
        this.root = this.xmlParser.parse(contentTypesXml);

        // build the content types lookup
        this.contentTypes = {};
        for (const node of this.root.childNodes) {

            if (node.nodeName !== 'Default')
                continue;

            const genNode = (node as XmlGeneralNode);
            const contentTypeAttribute = genNode.attributes['ContentType'];
            if (!contentTypeAttribute)
                continue;

            this.contentTypes[contentTypeAttribute] = true;
        }
    }
}
