import * as JSZip from 'jszip';
import { MimeType, MimeTypeHelper } from '../mimeType';
import { Path } from '../utils';
import { XmlGeneralNode, XmlNode, XmlParser } from '../xml';

/**
 * Handles the relationship logic of a single docx "part".  
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class Rels {

    private root: XmlNode;
    private relIds: IMap<boolean>;
    private nextRelId = 0;
    
    private readonly partDir: string;
    private readonly relsFilePath: string;

    constructor(
        partPath: string,
        private readonly zip: JSZip,
        private readonly xmlParser: XmlParser
    ) {

        this.partDir = Path.getDirectory(partPath);
        const partFilename = Path.getFilename(partPath);
        this.relsFilePath = `${this.partDir}/_rels/${partFilename}.rels`;
    }

    /**
     * Returns the rel ID.
     */
    public async add(relTarget: string, mime: MimeType): Promise<string> {

        // relTarget should be relative to the part dir
        if (relTarget.startsWith(this.partDir)) {
            relTarget = relTarget.substr(this.partDir.length + 1);
        }

        // parse rels file
        await this.parseRelsFile();

        // add rel node
        const relId = this.getNextRelId();
        const relType = MimeTypeHelper.getOfficeRelType(mime);
        const relNode = XmlNode.createGeneralNode('Relationship');
        relNode.attributes = [
            { name: "Id", value: relId },
            { name: "Type", value: relType },
            { name: "Target", value: relTarget }
        ];
        this.root.childNodes.push(relNode);

        // return
        return relId;
    }

    /**
     * Save the rels file back to the zip.
     */
    public async save(): Promise<void> {

        // not change - no need to save
        if (!this.root)
            return;

        const xmlContent = this.xmlParser.serialize(this.root);
        this.zip.file(this.relsFilePath, xmlContent);
    }

    //
    // private methods
    //

    private getNextRelId(): string {
        
        let relId: string;;
        do {
            this.nextRelId++;
            relId = 'rId' + this.nextRelId;
        } while (this.relIds[relId]);

        return relId;
    }

    private async parseRelsFile(): Promise<void> {
        if (this.root)
            return;

        // parse the xml file
        let relsXml: string;
        const relsFile = this.zip.file(this.relsFilePath);
        if (relsFile) {
            relsXml = await relsFile.async('text');
        } else {
            relsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                      </Relationships>`;
        }
        this.root = this.xmlParser.parse(relsXml);

        // build relIds lookup
        this.relIds = {};
        for (const rel of this.root.childNodes) {
            const relId = (rel as XmlGeneralNode).attributes
                .find(attr => attr.name.toLowerCase() === 'id')
                .value;
            this.relIds[relId] = true;
        }
    }
}