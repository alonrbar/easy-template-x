import * as JSZip from 'jszip';
import { ScopeData, Tag, TemplateContext } from '../compilation';
import { Binary } from '../utils';
import { XmlTextNode, XmlNode } from '../xmlNode';
import { TemplatePlugin } from './templatePlugin';

let imageId = 1;

export interface ImageContent {
    _type: 'image';
    source: Binary;
    width?: number;
    height?: number;
}

export class ImagePlugin extends TemplatePlugin {
    public readonly contentType = 'image';

    public simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): void {
        tag.xmlTextNode.textContent = '';

        const content: ImageContent = data.getScopeData();
        if (!content || !content.source)
            return;

        const id = imageId++;
        const width = 100;
        const height = 200;
        const imagePath = this.addFileToZip(content.source, 'png', context.zipFile);
        const relId = this.addRelsEntry(imagePath);
        this.insertMarkup(tag.xmlTextNode, id, relId, width, height);
    }

    private insertMarkup(node: XmlTextNode, id: number, relId: string, width: number, height: number): void {
        const cx = (width * 360e3).toFixed(0);
        const cy = (height * 360e3).toFixed(0);
        const name = `Picture ${id}`;
        const imageMarkup = `
            <w:drawing>
                <wp:inline distT="0" distB="0" distL="0" distR="0">
                    <wp:extent cx="2679700" cy="4711700"/>
                    <wp:effectExtent l="0" t="0" r="6350" b="0"/>
                    <wp:docPr id="${id}" name="${name}"/>
                    <wp:cNvGraphicFramePr>
                        <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                    </wp:cNvGraphicFramePr>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                            ${this.pictureMarkup(name, relId, cx, cy)}
                        </a:graphicData>
                    </a:graphic>
                </wp:inline>
            </w:drawing>
        `;
        const imageXml = this.utilities.xmlParser.parse(imageMarkup);
        XmlNode.insertAfter(imageXml, node);
        XmlNode.remove(node);
    }

    private pictureMarkup(name: string, relId: string, cx: string, cy: string) {
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
                        <a:ext cx="${cx}" cy="${cy}"/>
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

    private addFileToZip(file: Binary, extension: string, zip: JSZip): string {

        // find image file name
        const filenames = zip.folder('media').files;
        let num = 0;
        let filename = '';
        do {
            num++;
            filename = `image${num}.${extension}`;
        } while (filenames[filename]);

        // add image
        zip.folder('media').file(`image${num}.${extension}`, file);

        return `media/${filename}`;
    }

    private addRelsEntry(path: string): string {
        const relId = 'rId4';

        const entry = XmlNode.createGeneralNode('Relationship');
        entry.attributes = [
            { name: "Id", value: relId },
            { name: "Type", value: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" },
            { name: "Target", value: path }
        ];

        return relId;
    }
}