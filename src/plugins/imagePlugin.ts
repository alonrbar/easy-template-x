import { ScopeData, Tag, TemplateContext } from '../compilation';
import { MimeType } from '../mimeType';
import { Binary } from '../utils';
import { XmlNode } from '../xml';
import { TemplatePlugin } from './templatePlugin';

let imageId = 1;

export type ImageFormat = MimeType.Jpeg | MimeType.Png;

export interface ImageContent {
    _type: 'image';
    source: Binary;
    format: ImageFormat;
    width?: number;
    height?: number;
}

export class ImagePlugin extends TemplatePlugin {

    public readonly contentType = 'image';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const content: ImageContent = data.getScopeData();
        if (!content || !content.source) {
            XmlNode.remove(tag.xmlTextNode);
            return;
        }

        const currentImageId = imageId++;
        const relId = await context.docx.addMedia(content.source, content.format);
        const imageXml = this.createMarkup(currentImageId, relId, content.width, content.height);

        const wordTextNode = this.utilities.docxParser.containingTextNode(tag.xmlTextNode);
        XmlNode.remove(tag.xmlTextNode);
        XmlNode.insertAfter(imageXml, wordTextNode);
    }

    private createMarkup(imageId: number, relId: string, width: number, height: number): XmlNode {

        // http://officeopenxml.com/drwPicInline.php

        const name = `Picture ${imageId}`;
        const imageMarkup = `
            <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                    <wp:extent cx="2679700" cy="4711700"/>
                    <wp:effectExtent l="0" t="0" r="6350" b="0"/>
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

        // TODO: is this fast enough? should we create the markup from plain objects or otherwise cache the result?
        const imageXml = this.utilities.xmlParser.parse(imageMarkup);
        return imageXml;
    }

    private pictureMarkup(name: string, relId: string, width: number, height: number) {

        // http://officeopenxml.com/drwPic.php

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
                        ${this.sizeMarkup(width, height)}
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

    private sizeMarkup(width: number, height: number): string {

        const hasWidth = Number.isFinite(width);
        const hasHeight = Number.isFinite(height);

        if (!hasWidth && !hasHeight)
            return '';

        let sizeString = '';
        if (hasWidth) {
            const cx = (width * 360e3).toFixed(0);
            sizeString += ` cx="${cx}"`;
        }
        if (hasHeight) {
            const cy = (height * 360e3).toFixed(0);
            sizeString += ` cy="${cy}"`;
        }

        return `<a:ext${sizeString}/>`;
    }
}