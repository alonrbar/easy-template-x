import { OmlNode } from "src/office";
import { xml, XmlGeneralNode, XmlNodeType } from "src/xml";
import { MalformedFileError } from "src/errors";
import { ImageContent } from "./imageContent";
import { nameFromId, pixelsToEmu } from "./imageUtils";

export function updateImage(drawingContainerNode: XmlGeneralNode, imageId: number, relId: string, content: ImageContent): void {
        
    const inlineNode = xml.query.findByPath(drawingContainerNode, XmlNodeType.General, OmlNode.Wp.Inline);
    const floatingNode = xml.query.findByPath(drawingContainerNode, XmlNodeType.General, OmlNode.Wp.FloatingAnchor);
    const drawingNode = (inlineNode || floatingNode);
    if (!inlineNode && !floatingNode) {
        throw new MalformedFileError("Invalid drawing container node. Expected inline or floating anchor node.");
    }
    const pictureNode = xml.query.findByPath(drawingNode, XmlNodeType.General, OmlNode.A.Graphic, OmlNode.A.GraphicData, OmlNode.Pic.Pic);
    if (!pictureNode) {
        throw new MalformedFileError("Invalid drawing container node. Expected picture node.");
    }

    // Set rel ID
    setRelId(pictureNode, relId);

    // Update non-visual properties
    updateNonVisualProps(drawingNode, pictureNode, imageId, content);

    // Update size
    updateSize(drawingNode, pictureNode, content);

    // TODO: Support image transparency override
}

function setRelId(pictureNode: XmlGeneralNode, relId: string) {
    const blipNode = xml.query.findByPath(pictureNode, XmlNodeType.General, OmlNode.Pic.BlipFill, OmlNode.A.Blip);

    pictureNode.attributes["r:embed"] = relId;
    blipNode.attributes["r:embed"] = relId;
}

function updateNonVisualProps(drawingNode: XmlGeneralNode, pictureNode: XmlGeneralNode, imageId: number, content: ImageContent) {
    const docPrNode = xml.query.findByPath(drawingNode, XmlNodeType.General, OmlNode.Wp.DocPr);
    if (!docPrNode) {
        throw new MalformedFileError("Cannot find doc properties node.");
    }

    const nvPicPrNode = xml.query.findByPath(pictureNode, XmlNodeType.General, OmlNode.Pic.NvPicPr, OmlNode.Pic.CnVPr);
    if (!nvPicPrNode) {
        throw new MalformedFileError("Cannot find non-visual picture properties node.");
    }

    docPrNode.attributes["id"] = imageId.toString();
    nvPicPrNode.attributes["id"] = imageId.toString();

    const imageName = nameFromId(imageId);
    docPrNode.attributes["name"] = imageName;
    nvPicPrNode.attributes["name"] = imageName;

    if (content.altText) {
        docPrNode.attributes["descr"] = content.altText;
        nvPicPrNode.attributes["descr"] = content.altText;
    }
}

function updateSize(drawingNode: XmlGeneralNode, pictureNode: XmlGeneralNode, content: ImageContent) {
    if (typeof content.width !== 'number' && typeof content.height !== 'number') {
        return;
    }

    const drawingExtentNode = xml.query.findByPath(drawingNode, XmlNodeType.General, OmlNode.Wp.Extent);
    if (!drawingExtentNode) {
        throw new MalformedFileError("Cannot find drawing extent node.");
    }
    const pictureExtentNode = xml.query.findByPath(pictureNode, XmlNodeType.General, OmlNode.Pic.SpPr, OmlNode.Pic.Xfrm, OmlNode.Pic.Ext);
    if (!pictureExtentNode) {
        throw new MalformedFileError("Cannot find picture extent node.");
    }

    if (typeof content.width === 'number') {
        const widthEmu = pixelsToEmu(content.width);
        drawingExtentNode.attributes["cx"] = widthEmu.toString();
        pictureExtentNode.attributes["cx"] = widthEmu.toString();
    }
    if (typeof content.height === 'number') {
        const heightEmu = pixelsToEmu(content.height);
        drawingExtentNode.attributes["cy"] = heightEmu.toString();
        pictureExtentNode.attributes["cy"] = heightEmu.toString();
    }
}