import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { ImageContent } from "./imageContent";
import { nameFromId, pixelsToEmu, transparencyPercentToAlpha } from "./imageUtils";

export function createImage(imageId: number, relId: string, content: ImageContent): XmlNode {

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

    const name = nameFromId(imageId);
    const markupText = `
        <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0">
                <wp:extent cx="${pixelsToEmu(content.width)}" cy="${pixelsToEmu(content.height)}"/>
                <wp:effectExtent l="0" t="0" r="0" b="0"/>
                ${docProperties(imageId, name, content)}
                <wp:cNvGraphicFramePr>
                    <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
                </wp:cNvGraphicFramePr>
                <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                    <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        ${pictureMarkup(imageId, relId, name, content)}
                    </a:graphicData>
                </a:graphic>
            </wp:inline>
        </w:drawing>
    `;

    const markupXml = xml.parser.parse(markupText) as XmlGeneralNode;
    xml.modify.removeEmptyTextNodes(markupXml); // remove whitespace

    return markupXml;
}

function docProperties(imageId: number, name: string, content: ImageContent): string {
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

function pictureMarkup(imageId: number, relId: string, name: string, content: ImageContent) {

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
                    ${transparencyMarkup(content.transparencyPercent)}
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
                    <a:ext cx="${pixelsToEmu(content.width)}" cy="${pixelsToEmu(content.height)}"/>
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

function transparencyMarkup(transparencyPercent: number): string {
    if (transparencyPercent === null || transparencyPercent === undefined) {
        return '';
    }

    const alpha = transparencyPercentToAlpha(transparencyPercent);
    return `<a:alphaModFix amt="${alpha}" />`;
}