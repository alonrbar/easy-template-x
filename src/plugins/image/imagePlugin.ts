import { ScopeData, Tag, TemplateContext } from '../../compilation';
import { MimeTypeHelper } from '../../mimeType';
import { XmlGeneralNode, XmlNode } from '../../xml';
import { TemplatePlugin } from '../templatePlugin';
import { ImageContent } from './imageContent';

/**
 * Apparently it is not that important for the ID to be unique...
 * Word displays two images correctly even if they both have the same ID.
 * Further more, Word will assign each a unique ID upon saving (it assigns
 * consecutive integers starting with 1).
 *
 * Note: The same principal applies to image names.
 *
 * Tested in Word v1908
 */
let nextImageId = 1;

export class ImagePlugin extends TemplatePlugin {

    public readonly contentType = 'image';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);

        const content = data.getScopeData<ImageContent>();
        if (!content || !content.source) {
            XmlNode.remove(wordTextNode);
            return;
        }

        // add the image file into the archive
        const mediaFilePath = await context.docx.mediaFiles.add(content.source, content.format);
        const relType = MimeTypeHelper.getOfficeRelType(content.format);
        const relId = await context.currentPart.rels.add(mediaFilePath, relType);
        await context.docx.contentTypes.ensureContentType(content.format);

        // create the xml markup
        const imageId = nextImageId++;
        const imageXml = this.createMarkup(imageId, relId, content.width, content.height);

        XmlNode.insertAfter(imageXml, wordTextNode);
        XmlNode.remove(wordTextNode);
    }

    private createMarkup(imageId: number, relId: string, width: number, height: number): XmlNode {

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
                    <wp:extent cx="${this.pixelsToEmu(width)}" cy="${this.pixelsToEmu(height)}"/>
                    <wp:effectExtent l="0" t="0" r="0" b="0"/>
                    <wp:docPr id="${imageId}" name="${name}"/>
                    <wp:cNvGraphicFramePr>
                        <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                    </wp:cNvGraphicFramePr>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                            ${this.pictureMarkup(name, relId, width, height)}
                        </a:graphicData>
                    </a:graphic>
                </wp:inline>
            </w:drawing>
        `;

        const markupXml = this.utilities.xmlParser.parse(markupText) as XmlGeneralNode;
        XmlNode.removeEmptyTextNodes(markupXml); // remove whitespace

        return markupXml;
    }

    private pictureMarkup(name: string, relId: string, width: number, height: number) {

        // http://officeopenxml.com/drwPic.php

        // legend:
        // nvPicPr - non-visual picture properties - id, name, etc.
        // blipFill - binary large image (or) picture fill - image size, image fill, etc.
        // spPr - shape properties - frame size, frame fill, etc.

        return `
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                    <pic:cNvPr id="0" name="${name}"/>
                    <pic:cNvPicPr>
                        <a:picLocks noChangeAspect="1" noChangeArrowheads="1"/>
                    </pic:cNvPicPr>
                </pic:nvPicPr>
                <pic:blipFill>
                    <a:blip r:embed="${relId}">
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
                        <a:ext cx="${this.pixelsToEmu(width)}" cy="${this.pixelsToEmu(height)}"/>
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

    private pixelsToEmu(pixels: number): number {

        // https://stackoverflow.com/questions/20194403/openxml-distance-size-units
        // https://docs.microsoft.com/en-us/windows/win32/vml/msdn-online-vml-units#other-units-of-measurement
        // https://en.wikipedia.org/wiki/Office_Open_XML_file_formats#DrawingML
        // http://www.java2s.com/Code/CSharp/2D-Graphics/ConvertpixelstoEMUEMUtopixels.htm

        return Math.round(pixels * 9525);
    }
}
