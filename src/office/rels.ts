import { IMap } from '../types';
import { Path } from '../utils';
import { XmlGeneralNode, XmlNode, XmlParser } from '../xml';
import { Zip } from '../zip';
import { Relationship, RelTargetMode } from './relationship';

/**
 * Handles the relationship logic of a single docx "part".
 * http://officeopenxml.com/anatomyofOOXML.php
 */
export class Rels {

    private rels: IMap<Relationship>;
    private relTargets: IMap<string>;
    private nextRelId = 0;

    private readonly partDir: string;
    private readonly relsFilePath: string;

    constructor(
        partPath: string,
        private readonly zip: Zip,
        private readonly xmlParser: XmlParser
    ) {

        this.partDir = partPath && Path.getDirectory(partPath);
        const partFilename = partPath && Path.getFilename(partPath);
        this.relsFilePath = Path.combine(this.partDir, '_rels', `${partFilename ?? ''}.rels`);
    }

    /**
     * Returns the rel ID.
     */
    public async add(relTarget: string, relType: string, relTargetMode?: RelTargetMode): Promise<string> {

        // if relTarget is an internal file it should be relative to the part dir
        if (this.partDir && relTarget.startsWith(this.partDir)) {
            relTarget = relTarget.substr(this.partDir.length + 1);
        }

        // parse rels file
        await this.parseRelsFile();

        // already exists?
        const relTargetKey = this.getRelTargetKey(relType, relTarget);
        let relId = this.relTargets[relTargetKey];
        if (relId)
            return relId;

        // create rel node
        relId = this.getNextRelId();
        const rel = new Relationship({
            id: relId,
            type: relType,
            target: relTarget,
            targetMode: relTargetMode
        });

        // update lookups
        this.rels[relId] = rel;
        this.relTargets[relTargetKey] = relId;

        // return
        return relId;
    }

    public async list(): Promise<Relationship[]> {
        await this.parseRelsFile();
        return Object.values(this.rels);
    }

    /**
     * Save the rels file back to the zip.
     * Called automatically by the holding `Docx` before exporting.
     */
    public async save(): Promise<void> {

        // not change - no need to save
        if (!this.rels)
            return;

        // create rels xml
        const root = this.createRootNode();
        root.childNodes = Object.values(this.rels).map(rel => rel.toXml());

        // serialize and save
        const xmlContent = this.xmlParser.serialize(root);
        this.zip.setFile(this.relsFilePath, xmlContent);
    }

    //
    // private methods
    //

    private getNextRelId(): string {

        let relId: string;
        do {
            this.nextRelId++;
            relId = 'rId' + this.nextRelId;
        } while (this.rels[relId]);

        return relId;
    }

    private async parseRelsFile(): Promise<void> {

        // already parsed
        if (this.rels)
            return;

        // parse xml
        let root: XmlNode;
        const relsFile = this.zip.getFile(this.relsFilePath);
        if (relsFile) {
            const xml = await relsFile.getContentText();
            root = this.xmlParser.parse(xml);
        } else {
            root = this.createRootNode();
        }

        // parse relationship nodes
        this.rels = {};
        this.relTargets = {};
        for (const relNode of root.childNodes) {

            const attributes = (relNode as XmlGeneralNode).attributes;
            if (!attributes)
                continue;

            const idAttr = attributes['Id'];
            if (!idAttr)
                continue;

            // store rel
            const rel = Relationship.fromXml(relNode as XmlGeneralNode);
            this.rels[idAttr] = rel;

            // create rel target lookup
            const typeAttr = attributes['Type'];
            const targetAttr = attributes['Target'];
            if (typeAttr && targetAttr) {
                const relTargetKey = this.getRelTargetKey(typeAttr, targetAttr);
                this.relTargets[relTargetKey] = idAttr;
            }
        }
    }

    private getRelTargetKey(type: string, target: string): string {
        return `${type} - ${target}`;
    }

    private createRootNode(): XmlGeneralNode {
        const root = XmlNode.createGeneralNode('Relationships');
        root.attributes = {
            'xmlns': 'http://schemas.openxmlformats.org/package/2006/relationships'
        };
        root.childNodes = [];
        return root;
    }
}
