import { OmlNode } from "src/office";
import { xml, XmlGeneralNode, XmlNodeType } from "src/xml";
import { MalformedFileError } from "src/errors";
import { ImageContent } from "./imageContent";
import { nameFromId } from "./imageUtils";

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

    // TODO:
    // - Support image size override
    // - Support image transparency override
}

function setRelId(pictureNode: XmlGeneralNode, relId: string) {
    const blipNode = xml.query.findByPath(pictureNode, XmlNodeType.General, OmlNode.Pic.BlipFill, OmlNode.Pic.Blip);

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