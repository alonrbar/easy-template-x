import { Path } from '../utils';
import { Zip } from '../zip';
import { XmlParser, XmlNode } from 'src/xml';

/**
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class CustomXmlFiles {

    private static readonly itemFileRegEx: RegExp = /customXml\/item(\d+)\.xml/;

    private loaded: boolean = false;
    private readonly files: Map<string, XmlNode> = new Map<string, XmlNode>();

    constructor(
        private readonly zip: Zip, 
        private readonly xmlParser: XmlParser) {
    }

    public async save() {
        if (!this.loaded) {
            // Never loaded the custom XML Files so they cannot have been changed
            return;
        }

        this.files.forEach((value, key) => {
            this.zip.setFile(key, this.xmlParser.serialize(value));
        });
    }

    public async setNode(nodePath: string, node: XmlNode) {
        if (this.files.size === 0) {
            this.loadFiles();
        }
    }

    public async loadFiles(): Promise<Map<string, XmlNode>> {
        if (this.loaded) {
            return this.files;
        }

        for (const path of this.zip.listFiles()) {

            if (!path.match(CustomXmlFiles.itemFileRegEx))
                continue;

            const filename = Path.getFilename(path);
            if (!filename)
                continue;

            const fileData: string = await this.zip.getFile(path).getContentText();
            const node: XmlNode = this.xmlParser.parse(fileData);
            this.files.set(path, node)
        }

        this.loaded = true;

        return this.files;
    }
}