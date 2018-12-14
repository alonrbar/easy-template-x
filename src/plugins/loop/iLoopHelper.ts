import { Tag } from '../../compilation';
import { XmlNode } from '../../xmlNode';
import { PluginUtilities } from '../templatePlugin';

export interface ILoopHelper {

    setUtilities(utilities: PluginUtilities): void;

    splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult;
    
    mergeBack(compiledNodes: XmlNode[][], firstNode: XmlNode, lastNode: XmlNode): void;
}

export interface SplitBeforeResult {
    firstNode: XmlNode;
    nodesToRepeat: XmlNode[];
    lastNode: XmlNode;
}