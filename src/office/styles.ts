import { xml, XmlGeneralNode, XmlNodeType } from "src/xml";
import { Zip } from "src/zip";
import { OmlNode } from "./omlNode";
import { RelType } from "./relationship";
import { RelsFile } from "./relsFile";

export type StyleType = 'paragraph' | 'character' | 'table' | 'numbering';

/**
 * The styles of a document (defined in its styles part).
 *
 * The styles are read-only - changes are not persisted.
 */
export class Styles {

    /**
     * Style nodes by style id. Style ids are unique across all style types.
     */
    private readonly styles = new Map<string, XmlGeneralNode>();
    private readonly defaultIds = new Map<StyleType, string>();
    private loaded: Promise<void>;

    private readonly mainDocumentRels: RelsFile;
    private readonly zip: Zip;

    constructor(mainDocumentRels: RelsFile, zip: Zip) {
        this.mainDocumentRels = mainDocumentRels;
        this.zip = zip;
    }

    /**
     * Find a style property node by its path inside the style node, walking
     * up the style's `basedOn` chain until the property is found.
     *
     * An empty style id refers to the default style of the given type.
     */
    public async findProperty(type: StyleType, styleId: string, ...path: string[]): Promise<XmlGeneralNode> {
        await this.load();

        const visited = new Set<string>();

        let currentId = styleId || this.defaultIds.get(type);
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);

            const style = this.styles.get(currentId);
            if (style?.attributes?.['w:type'] !== type)
                return null;

            const property = xml.query.findByPath(style, XmlNodeType.General, ...path);
            if (property)
                return property;

            const basedOn = xml.query.findByPath(style, XmlNodeType.General, OmlNode.W.BasedOn);
            currentId = basedOn?.attributes?.['w:val'];
        }

        return null;
    }

    /**
     * Whether paragraphs with the given style are list items. That is, the
     * style applies list numbering, either itself or through the styles it is
     * based on.
     *
     * An empty style id refers to the default paragraph style.
     */
    public async isNumbered(paragraphStyleId: string): Promise<boolean> {
        const numberingId = await this.findProperty(
            'paragraph',
            paragraphStyleId,
            OmlNode.W.ParagraphProperties,
            OmlNode.W.NumberProperties,
            OmlNode.W.NumberingId
        );

        // Numbering id 0 explicitly removes the numbering.
        return !!numberingId && numberingId.attributes?.['w:val'] !== '0';
    }

    //
    // private methods
    //

    private load(): Promise<void> {
        if (!this.loaded) {
            this.loaded = this.parseStylesFile();
        }
        return this.loaded;
    }

    private async parseStylesFile(): Promise<void> {

        // Read the styles part directly (rather than opening it through the
        // main document) so it is not re-serialized on export.
        const rels = await this.mainDocumentRels.list();
        const stylesRel = rels.find(rel => rel.type === RelType.Styles);
        if (!stylesRel)
            return;

        const stylesPath = this.mainDocumentRels.absoluteTargetPath(stylesRel.target);
        const stylesFile = this.zip.getFile(stylesPath);
        if (!stylesFile)
            return;

        const stylesXml = await stylesFile.getContentText();
        const stylesRoot = xml.parser.parse(stylesXml);

        for (const node of (stylesRoot?.childNodes ?? [])) {
            if (!xml.query.isGeneralNode(node) || node.nodeName !== OmlNode.W.Style)
                continue;

            const styleId = node.attributes?.['w:styleId'];
            if (!styleId)
                continue;

            this.styles.set(styleId, node);
            if (node.attributes['w:default'] === '1') {
                this.defaultIds.set(node.attributes['w:type'] as StyleType, styleId);
            }
        }
    }
}
