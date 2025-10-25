import { ScopeData } from "src/compilation/scopeData";
import { Tag, TagPlacement } from "src/compilation/tag";
import { TemplateContext } from "src/compilation/templateContext";
import { TemplateSyntaxError } from "src/errors";
import { MimeTypeHelper } from "src/mimeType";
import { officeMarkup, OmlNode } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { isNumber } from "src/utils/number";
import { xml, XmlGeneralNode } from "src/xml";
import { createImage } from "./createImage";
import { ImageContent } from "./imageContent";
import { updateImage } from "./updateImage";

interface ImagePluginContext {
    /**
     * Last drawing object ID for each OOXML part.
     * Key is the OOXML part path.
     */
    lastDrawingObjectId: Record<string, number>;
}

export class ImagePlugin extends TemplatePlugin {

    public readonly contentType = 'image';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const content = data.getScopeData<ImageContent>();
        if (!content || !content.source) {
            officeMarkup.modify.removeTag(tag);
            return;
        }

        // Add the image file into the archive
        const mediaFilePath = await context.docx.mediaFiles.add(content.source, content.format);
        const relType = MimeTypeHelper.getOfficeRelType(content.format);
        const relId = await context.currentPart.rels.add(mediaFilePath, relType);
        await context.docx.contentTypes.ensureContentType(content.format);

        // Generate a unique image ID
        const imageId = await this.getNextImageId(context);

        // For text tags, create xml markup from scratch
        if (tag.placement === TagPlacement.TextNode) {
            const imageXml = createImage(imageId, relId, content);
            const wordTextNode = officeMarkup.query.containingTextNode(tag.xmlTextNode);
            xml.modify.insertAfter(imageXml, wordTextNode);
        }

        // For attribute tags, modify the existing markup
        if (tag.placement === TagPlacement.Attribute) {
            const drawingNode = xml.query.findParentByName(tag.xmlNode, OmlNode.W.Drawing);
            if (!drawingNode) {
                throw new TemplateSyntaxError(`Cannot find placeholder image for tag "${tag.rawText}".`);
            }
            updateImage(tag, drawingNode, imageId, relId, content);
        }

        officeMarkup.modify.removeTag(tag);
    }

    private async getNextImageId(context: TemplateContext): Promise<number> {

        // Init plugin context.
        if (!context.pluginContext[this.contentType]) {
            context.pluginContext[this.contentType] = {};
        }

        const pluginContext: ImagePluginContext = context.pluginContext[this.contentType];
        if (!pluginContext.lastDrawingObjectId) {
            pluginContext.lastDrawingObjectId = {};
        }

        const lastIdMap = pluginContext.lastDrawingObjectId;
        const lastIdKey = context.currentPart.path;

        // Get next image ID if already initialized.
        if (lastIdMap[lastIdKey]) {
            lastIdMap[lastIdKey]++;
            return lastIdMap[lastIdKey];
        }

        // Init next image ID.
        const partRoot = await context.currentPart.xmlRoot();
        const maxDepth = context.options.maxXmlDepth;

        // Get all existing doc props IDs
        const docProps = xml.query.descendants(partRoot, maxDepth, node => {
            return xml.query.isGeneralNode(node) && node.nodeName === OmlNode.Wp.DocPr;
        }) as XmlGeneralNode[];

        // Start counting from the current max
        const ids = docProps.map(prop => parseInt(prop.attributes.id)).filter(isNumber);
        const maxId = Math.max(...ids, 0);

        lastIdMap[lastIdKey] = maxId + 1;
        return lastIdMap[lastIdKey];
    }
}
