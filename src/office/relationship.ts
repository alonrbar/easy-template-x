import { XmlGeneralNode, XmlNode } from '../xml';

export type RelTargetMode = 'Internal' | 'External';

export class Relationship {

    public static fromXml(xml: XmlGeneralNode): Relationship {
        return new Relationship({
            id: xml.attributes?.['Id'],
            type: xml.attributes?.['Type'],
            target: xml.attributes?.['Target'],
            targetMode: xml.attributes?.['TargetMode'] as RelTargetMode,
        });
    }

    id: string;
    type: string;
    target: string;
    targetMode: RelTargetMode;

    constructor(initial?: Partial<Relationship>) {
        Object.assign(this, initial);
    }

    public toXml(): XmlGeneralNode {

        const node = XmlNode.createGeneralNode('Relationship');
        node.attributes = {};

        // set only non-empty attributes
        for (const propKey of Object.keys(this)) {
            const value = (this as any)[propKey];
            if (value && typeof value === 'string') {
                const attrName = propKey[0].toUpperCase() + propKey.substr(1);
                node.attributes[attrName] = value;
            }
        }

        return node;
    }
}
