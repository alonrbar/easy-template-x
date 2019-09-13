import { MimeType, MimeTypeHelper } from '../mimeType';
import { Path } from '../utils';
import { XmlGeneralNode, XmlNode, XmlParser } from '../xml';
import { Zip } from '../zip';

/**
 * Handles the relationship logic of a single docx "part".  
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class Rels {

    private root: XmlNode;
    private relIds: IMap<boolean>;
    private relTargets: IMap<string>;
    private nextRelId = 0;

    private readonly partDir: string;
    private readonly relsFilePath: string;

    constructor(
        partPath: string,
        private readonly zip: Zip,
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

        // already exists?
        const relTargetKey = this.getRelTargetKey(mime, relTarget);
        let relId = this.relTargets[relTargetKey];
        if (relId)
            return relId;

        // add rel node
        relId = this.getNextRelId();
        const relType = MimeTypeHelper.getOfficeRelType(mime);
        const relNode = XmlNode.createGeneralNode('Relationship');
        relNode.attributes = [
            { name: "Id", value: relId },
            { name: "Type", value: relType },
            { name: "Target", value: relTarget }
        ];
        this.root.childNodes.push(relNode);

        // update lookups
        this.relIds[relId] = true;
        this.relTargets[relTargetKey] = relId;

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
        this.zip.setFile(this.relsFilePath, xmlContent);
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
        const relsFile = this.zip.getFile(this.relsFilePath);
        if (relsFile) {
            relsXml = await relsFile.getContentText();
        } else {
            relsXml = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                      </Relationships>`;
        }
        this.root = this.xmlParser.parse(relsXml);

        // build lookups
        this.relIds = {};
        this.relTargets = {};
        for (const rel of this.root.childNodes) {

            const attributes = (rel as XmlGeneralNode).attributes;
            if (!attributes)
                continue;

            // relIds lookup
            const idAttr = attributes.find(attr => attr.name.toLowerCase() === 'id');
            if (!idAttr || !idAttr.value)
                continue;
            this.relIds[idAttr.value] = true;

            // rel target lookup
            const typeAttr = attributes.find(attr => attr.name.toLowerCase() === 'Type');
            const targetAttr = attributes.find(attr => attr.name.toLowerCase() === 'Target');
            if (typeAttr && typeAttr.value && targetAttr && targetAttr.value) {
                const relTargetKey = this.getRelTargetKey(typeAttr.value as MimeType, targetAttr.value);
                this.relTargets[relTargetKey] = idAttr.value;
            }
        }
    }

    private getRelTargetKey(type: MimeType, target: string): string {
        return `${type} - ${target}`;
    }
}