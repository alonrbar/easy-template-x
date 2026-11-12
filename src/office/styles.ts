import { xml, XmlGeneralNode, XmlNodeType } from "src/xml";
import { OmlNode } from "./omlNode";
import { OpenXmlPart } from "./openXmlPart";
import { RelType } from "./relationship";

export type StyleType = 'paragraph' | 'character' | 'table' | 'numbering';

/**
 * The styles of a document (defined in its styles part).
 */
export class Styles {

    /**
     * Style nodes by style id. Style ids are unique across all style types.
     */
    private readonly styles = new Map<string, XmlGeneralNode>();
    private readonly defaultIds = new Map<StyleType, string>();
    private loaded: Promise<void>;

    private readonly mainDocument: OpenXmlPart;

    constructor(mainDocument: OpenXmlPart) {
        this.mainDocument = mainDocument;
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
            this.loaded = this.parseStylesPart();
        }
        return this.loaded;
    }

    private async parseStylesPart(): Promise<void> {
        const stylesPart = await this.mainDocument.getFirstPartByType(RelType.Styles);
        if (!stylesPart)
            return;

        const stylesRoot = await stylesPart.xmlRoot();
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
