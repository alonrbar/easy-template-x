import { PathPart, ScopeData, Tag, TemplateContext } from '../../compilation';
import { TemplateData } from '../../templateData';
import { last } from '../../utils';
import { XmlNode } from '../../xml';
import { PluginUtilities, TemplatePlugin } from '../templatePlugin';
import { ILoopStrategy, LoopListStrategy, LoopParagraphStrategy, LoopTableStrategy } from './strategy';

export const LOOP_CONTENT_TYPE = 'loop';

export class LoopPlugin extends TemplatePlugin {

    public readonly contentType = LOOP_CONTENT_TYPE;

    private readonly loopStrategies: ILoopStrategy[] = [
        new LoopTableStrategy(),
        new LoopListStrategy(),
        new LoopParagraphStrategy() // the default strategy
    ];

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
        this.loopStrategies.forEach(strategy => strategy.setUtilities(utilities));
    }

    public async containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): Promise<void> {

        let value = data.getScopeData<TemplateData[]>();

        // Non array value - treat as a boolean condition.
        const isCondition = !Array.isArray(value);
        if (isCondition) {
            if (!!value) {
                value = [{}];
            } else {
                value = [];
            }
        }

        // vars
        const openTag = tags[0];
        const closeTag = last(tags);

        // select the suitable strategy
        const loopStrategy = this.loopStrategies.find(strategy => strategy.isApplicable(openTag, closeTag));
        if (!loopStrategy)
            throw new Error(`No loop strategy found for tag '${openTag.rawText}'.`);

        // prepare to loop
        const { firstNode, nodesToRepeat, lastNode } = loopStrategy.splitBefore(openTag, closeTag);

        // repeat (loop) the content
        const repeatedNodes = this.repeat(nodesToRepeat, value.length);

        // recursive compilation
        // (this step can be optimized in the future if we'll keep track of the
        // path to each token and use that to create new tokens instead of
        // search through the text again)
        const compiledNodes = await this.compile(isCondition, repeatedNodes, data, context);

        // merge back to the document
        loopStrategy.mergeBack(compiledNodes, firstNode, lastNode);
    }

    private repeat(nodes: XmlNode[], times: number): XmlNode[][] {
        if (!nodes.length || !times)
            return [];

        const allResults: XmlNode[][] = [];

        for (let i = 0; i < times; i++) {
            const curResult = nodes.map(node => XmlNode.cloneNode(node, true));
            allResults.push(curResult);
        }

        return allResults;
    }

    private async compile(isCondition: boolean, nodeGroups: XmlNode[][], data: ScopeData, context: TemplateContext): Promise<XmlNode[][]> {
        const compiledNodeGroups: XmlNode[][] = [];

        // compile each node group with it's relevant data
        for (let i = 0; i < nodeGroups.length; i++) {

            // create dummy root node
            const curNodes = nodeGroups[i];
            const dummyRootNode = XmlNode.createGeneralNode('dummyRootNode');
            curNodes.forEach(node => XmlNode.appendChild(dummyRootNode, node));

            // compile the new root
            const conditionTag = this.updatePathBefore(isCondition, data, i);
            await this.utilities.compiler.compile(dummyRootNode, data, context);
            this.updatePathAfter(isCondition, data, conditionTag);

            // disconnect from dummy root
            const curResult: XmlNode[] = [];
            while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
                const child = XmlNode.removeChild(dummyRootNode, 0);
                curResult.push(child);
            }
            compiledNodeGroups.push(curResult);
        }

        return compiledNodeGroups;
    }

    private updatePathBefore(isCondition: boolean, data: ScopeData, groupIndex: number): PathPart {

        // if it's a condition - don't go deeper in the path
        // (so we need to extract the already pushed condition tag)
        if (isCondition) {
            if (groupIndex > 0) {
                // should never happen - conditions should have at most one (synthetic) child...
                throw new Error(`Internal error: Unexpected group index ${groupIndex} for boolean condition at path "${data.pathString()}".`);
            }
            return data.pathPop();
        }

        // else, it's an array - push the current index
        data.pathPush(groupIndex);
        return null;
    }

    private updatePathAfter(isCondition: boolean, data: ScopeData, conditionTag: PathPart): void {

        // reverse the "before" path operation
        if (isCondition) {
            data.pathPush(conditionTag);
        } else {
            data.pathPop();
        }
    }
}

