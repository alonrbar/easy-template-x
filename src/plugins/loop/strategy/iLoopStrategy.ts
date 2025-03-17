import { Tag } from "src/compilation";
import { XmlNode } from "src/xml";

export interface ILoopStrategy {

    isApplicable(openTag: Tag, closeTag: Tag, isCondition: boolean): boolean;

    splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult;

    mergeBack(compiledNodes: XmlNode[][], firstNode: XmlNode, lastNode: XmlNode): void;
}

export interface SplitBeforeResult {
    firstNode: XmlNode;
    nodesToRepeat: XmlNode[];
    lastNode: XmlNode;
}
