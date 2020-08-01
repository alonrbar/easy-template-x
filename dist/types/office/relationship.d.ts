import { XmlGeneralNode } from '../xml';
export declare type RelTargetMode = 'Internal' | 'External';
export declare class Relationship {
    static fromXml(xml: XmlGeneralNode): Relationship;
    id: string;
    type: string;
    target: string;
    targetMode: RelTargetMode;
    constructor(initial?: Partial<Relationship>);
    toXml(): XmlGeneralNode;
}
