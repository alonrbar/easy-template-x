import { Tag } from '../../../compilation';
import { XmlNode } from '../../../xml';
import { PluginUtilities } from '../../templatePlugin';
import { ILoopStrategy, SplitBeforeResult } from './iLoopStrategy';
export declare class LoopTableStrategy implements ILoopStrategy {
    private utilities;
    setUtilities(utilities: PluginUtilities): void;
    isApplicable(openTag: Tag, closeTag: Tag): boolean;
    splitBefore(openTag: Tag, closeTag: Tag): SplitBeforeResult;
    mergeBack(rowGroups: XmlNode[][], firstRow: XmlNode, lastRow: XmlNode): void;
}
