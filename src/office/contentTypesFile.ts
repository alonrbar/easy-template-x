import * as JSZip from 'jszip';
import { MimeType, MimeTypeHelper } from '../mimeType';
import { XmlGeneralNode, XmlNode, XmlParser } from '../xml';

/**
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class ContentTypesFile {

    private static readonly contentTypesFilePath = '[Content_Types].xml';

    private addedNew = false;

    private root: XmlNode;

    private contentTypes: IMap<boolean>;

    constructor(
        private readonly zip: JSZip,
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
        typeNode.attributes = [
            { name: "Extension", value: extension },
            { name: "ContentType", value: mime }
        ];
        this.root.childNodes.push(typeNode);
        this.addedNew = true;
    }

    public async save(): Promise<void> {

        // not change - no need to save
        if (!this.addedNew)
            return;

        const xmlContent = this.xmlParser.serialize(this.root);
        this.zip.file(ContentTypesFile.contentTypesFilePath, xmlContent);
    }

    private async parseContentTypesFile(): Promise<void> {
        if (this.root)
            return;

        // parse the xml file
        const contentTypesXml = await this.zip.file(ContentTypesFile.contentTypesFilePath).async('text');
        this.root = this.xmlParser.parse(contentTypesXml);

        // build the content types lookup
        this.contentTypes = {};
        for (const node of this.root.childNodes) {

            if (node.nodeName !== 'Default')
                continue;

            const genNode = (node as XmlGeneralNode);
            const contentTypeAttribute = genNode.attributes.find(attr => attr.name === 'ContentType');
            if (!contentTypeAttribute)
                continue;

            this.contentTypes[contentTypeAttribute.value];
        }
    }
}