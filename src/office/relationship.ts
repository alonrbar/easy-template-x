import { xml, XmlGeneralNode } from "src/xml";

/**
 * The types of relationships that can be created in a docx file.
 * A non-comprehensive list.
 */
export const RelType = Object.freeze({
    Package: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/package',
    MainDocument: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
    Header: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
    Footer: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
    Styles: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
    SharedStrings: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
    Link: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
    Image: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
    Chart: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart',
    ChartColors: 'http://schemas.microsoft.com/office/2011/relationships/chartColorStyle',
    Worksheet: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
    Table: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/table',
} as const);

export type RelTargetMode = 'Internal' | 'External';

export class Relationship {

    public static fromXml(xml: XmlGeneralNode): Relationship {
        return new Relationship({
            id: xml.attributes?.['Id'],
            type: xml.attributes?.['Type'],
            target: Relationship.normalizeRelTarget(xml.attributes?.['Target']),
            targetMode: xml.attributes?.['TargetMode'] as RelTargetMode,
        });
    }

    public static normalizeRelTarget(target: string): string {
        if (!target) {
            return target;
        }
        if (target.startsWith('/')) {
            return target.substring(1);
        }
        return target;
    }

    id: string;
    type: string;
    target: string;
    targetMode: RelTargetMode;

    constructor(initial?: Partial<Relationship>) {
        Object.assign(this, initial);
    }

    public toXml(): XmlGeneralNode {

        const node = xml.create.generalNode('Relationship');
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
