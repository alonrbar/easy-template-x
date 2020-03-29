import { Tag } from '../../../compilation';
import { XmlNode } from '../../../xml';
import { PluginUtilities } from '../../templatePlugin';
export interface ILoopStrategy {
    setUtilities(utilities: PluginUtilities): void;
    isApplicable(openTag: Tag, closeTag: Tag): boolean;
    splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult;
    mergeBack(compiledNodes: XmlNode[][], firstNode: XmlNode, lastNode: XmlNode): void;
}
export interface SplitBeforeResult {
    firstNode: XmlNode;
    nodesToRepeat: XmlNode[];
    lastNode: XmlNode;
}
