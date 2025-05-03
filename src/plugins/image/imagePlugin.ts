import { ScopeData, Tag, TemplateContext } from "src/compilation";
import { TemplateDataError } from "src/errors";
import { MimeTypeHelper } from "src/mimeType";
import { officeMarkup } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { isNumber } from "src/utils/number";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { ImageContent } from "./imageContent";

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
            officeMarkup.modify.removeTag(tag.xmlTextNode);
            return;
        }

        // Add the image file into the archive
        const mediaFilePath = await context.docx.mediaFiles.add(content.source, content.format);
        const relType = MimeTypeHelper.getOfficeRelType(content.format);
        const relId = await context.currentPart.rels.add(mediaFilePath, relType);
        await context.docx.contentTypes.ensureContentType(content.format);

        // Create the xml markup
        const imageId = await this.getNextImageId(context);
        const imageXml = this.createMarkup(imageId, relId, content);

        const wordTextNode = officeMarkup.query.containingTextNode(tag.xmlTextNode);
        xml.modify.insertAfter(imageXml, wordTextNode);
        officeMarkup.modify.removeTag(tag.xmlTextNode);
    }

    private async getNextImageId(context: TemplateContext): Promise<number> {

        // Init plugin context.
        if (!context.pluginContext[this.contentType]) {
            context.pluginContext[this.contentType] = {};
        }
        if (!context.pluginContext[this.contentType]) {
            context.pluginContext[this.contentType] = {};
        }

        const pluginContext: ImagePluginContext = context.pluginContext[this.contentType];
        if (!pluginContext.lastDrawingObjectId) {
            pluginContext.lastDrawingObjectId = {};
        }
        const lastIdMap = pluginContext.lastDrawingObjectId;

        // Get next image ID if already initialized.
        if (lastIdMap[context.currentPart.path]) {
            lastIdMap[context.currentPart.path]++;
            return lastIdMap[context.currentPart.path];
        }

        // Init next image ID.
        const partRoot = await context.currentPart.xmlRoot();
        const maxDepth = context.options.maxXmlDepth;

        // Get all existing doc props IDs
        // (docPr stands for "Drawing Object Non-Visual Properties", which isn't
        // exactly a good acronym but that's how it's called nevertheless)
        const docProps = xml.query.descendants(partRoot, maxDepth, node => {
            return xml.query.isGeneralNode(node) && node.nodeName === 'wp:docPr';
        }) as XmlGeneralNode[];

        // Start counting from the current max
        const ids = docProps.map(prop => parseInt(prop.attributes.id)).filter(isNumber);
        const maxId = Math.max(...ids, 0);

        lastIdMap[context.currentPart.path] = maxId + 1;
        return lastIdMap[context.currentPart.path];
    }

    private createMarkup(imageId: number, relId: string, content: ImageContent): XmlNode {

        // http://officeopenxml.com/drwPicInline.php

        //
        // Performance note:
        //
        // I've tried to improve the markup generation performance by parsing
        // the string once and caching the result (and of course customizing it
        // per image) but it made no change whatsoever (in both cases 1000 items
        // loop takes around 8 seconds on my machine) so I'm sticking with this
        // approach which I find to be more readable.
        //

        const name = `Picture ${imageId}`;
        const markupText = `
            <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                    <wp:extent cx="${this.pixelsToEmu(content.width)}" cy="${this.pixelsToEmu(content.height)}"/>
                    <wp:effectExtent l="0" t="0" r="0" b="0"/>
                    ${this.docProperties(imageId, name, content)}
                    <wp:cNvGraphicFramePr>
                        <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                    </wp:cNvGraphicFramePr>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                            ${this.pictureMarkup(imageId, relId, name, content)}
                        </a:graphicData>
                    </a:graphic>
                </wp:inline>
            </w:drawing>
        `;

        const markupXml = xml.parser.parse(markupText) as XmlGeneralNode;
        xml.modify.removeEmptyTextNodes(markupXml); // remove whitespace

        return markupXml;
    }

    private docProperties(imageId: number, name: string, content: ImageContent): string {
        if (content.altText) {
            return `<wp:docPr id="${imageId}" name="${name}" descr="${content.altText}"/>`;
        }

        return `
            <wp:docPr id="${imageId}" name="${name}">
                <a:extLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
					<a:ext uri="{C183D7F6-B498-43B3-948B-1728B52AA6E4}">
						<adec:decorative xmlns:adec="http://schemas.microsoft.com/office/drawing/2017/decorative" val="1"/>
					</a:ext>
				</a:extLst>
            </wp:docPr>
        `;
    }

    private pictureMarkup(imageId: number, relId: string, name: string, content: ImageContent) {

        // http://officeopenxml.com/drwPic.php

        // Legend:
        // nvPicPr - non-visual picture properties - id, name, etc.
        // blipFill - binary large image (or) picture fill - image size, image fill, etc.
        // spPr - shape properties - frame size, frame fill, etc.

        return `
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                    <pic:cNvPr id="${imageId}" name="${name}"/>
                    <pic:cNvPicPr>
                        <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
                    </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                    <a:blip r:embed="${relId}">
                        ${this.transparencyMarkup(content.transparencyPercent)}
                        <a:extLst>
                            <a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}">
                                <a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/>
                            </a:ext>
                        </a:extLst>
                    </a:blip>
                    <a:srcRect/>
                    <a:stretch>
                        <a:fillRect/>
                    </a:stretch>
                </pic:blipFill>
                <pic:spPr bwMode="auto">
                    <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${this.pixelsToEmu(content.width)}" cy="${this.pixelsToEmu(content.height)}"/>
                    </a:xfrm>
                    <a:prstGeom prst="rect">
                        <a:avLst/>
                    </a:prstGeom>
                    <a:noFill/>
                    <a:ln>
                        <a:noFill/>
                    </a:ln>
                </pic:spPr>
            </pic:pic>
        `;
    }

    private transparencyMarkup(transparencyPercent: number) {
        if (transparencyPercent === null || transparencyPercent === undefined) {
            return '';
        }
        if (transparencyPercent < 0 || transparencyPercent > 100) {
            throw new TemplateDataError(`Transparency percent must be between 0 and 100, but was ${transparencyPercent}.`);
        }

        const alpha = Math.round((100 - transparencyPercent) * 1000);
        return `<a:alphaModFix amt="${alpha}" />`;
    }

    private pixelsToEmu(pixels: number): number {

        // https://stackoverflow.com/questions/20194403/openxml-distance-size-units
        // https://docs.microsoft.com/en-us/windows/win32/vml/msdn-online-vml-units#other-units-of-measurement
        // https://en.wikipedia.org/wiki/Office_Open_XML_file_formats#DrawingML
        // http://www.java2s.com/Code/CSharp/2D-Graphics/ConvertpixelstoEMUEMUtopixels.htm

        return Math.round(pixels * 9525);
    }
}
