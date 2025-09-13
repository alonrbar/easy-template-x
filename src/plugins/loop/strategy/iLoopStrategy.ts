import { TextNodeTag } from "src/compilation";
import { XmlNode } from "src/xml";

export interface ILoopStrategy {

    isApplicable(openTag: TextNodeTag, closeTag: TextNodeTag, isCondition: boolean): boolean;

    splitBefore(openTag: TextNodeTag, closeTag: TextNodeTag): SplitBeforeResult;

    mergeBack(compiledNodes: XmlNode[][], firstNode: XmlNode, lastNode: XmlNode): void;
}

export interface SplitBeforeResult {
    firstNode: XmlNode;
    nodesToRepeat: XmlNode[];
    lastNode: XmlNode;
}
