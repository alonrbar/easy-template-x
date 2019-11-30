import { XmlParser } from '../xml';
import { Zip } from '../zip';
export declare class Rels {
    private readonly zip;
    private readonly xmlParser;
    private root;
    private relIds;
    private relTargets;
    private nextRelId;
    private readonly partDir;
    private readonly relsFilePath;
    constructor(partPath: string, zip: Zip, xmlParser: XmlParser);
    add(relTarget: string, relType: string, additionalAttributes?: IMap<string>): Promise<string>;
    save(): Promise<void>;
    private getNextRelId;
    private parseRelsFile;
    private getRelTargetKey;
}
