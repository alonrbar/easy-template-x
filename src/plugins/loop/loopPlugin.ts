import { PathPart, ScopeData } from "src/compilation/scopeData";
import { Tag, TagPlacement } from "src/compilation/tag";
import { TemplateContext } from "src/compilation/templateContext";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup } from "src/office/officeMarkup";
import { PluginUtilities, TemplatePlugin } from "src/plugins/templatePlugin";
import { TemplateData } from "src/templateData";
import { last } from "src/utils";
import { xml, XmlNode } from "src/xml";
import { ILoopStrategy, LoopListStrategy, LoopParagraphStrategy, LoopTableColumnsStrategy, LoopTableRowsStrategy } from "./strategy";

export const LOOP_CONTENT_TYPE = 'loop';

export class LoopPlugin extends TemplatePlugin {

    public readonly contentType = LOOP_CONTENT_TYPE;

    private readonly loopStrategies: ILoopStrategy[] = [
        new LoopTableColumnsStrategy(),
        new LoopTableRowsStrategy(),
        new LoopListStrategy(),
        new LoopParagraphStrategy() // the default strategy
    ];

    public setUtilities(utilities: PluginUtilities): void {
        this.utilities = utilities;
    }

    public async containerTagReplacements(tags: Tag[], data: ScopeData, context: TemplateContext): Promise<void> {

        let value = data.getScopeData<TemplateData[]>();

        // Non array value - treat as a boolean condition.
        const isCondition = !Array.isArray(value);
        if (isCondition) {
            if (value) {
                value = [{}];
            } else {
                value = [];
            }
        }

        // Vars
        const openTag = tags[0];
        const closeTag = last(tags);

        if (openTag.placement !== TagPlacement.TextNode) {
            throw new TemplateSyntaxError(`Loop opening tag "${openTag.rawText}" must be placed in a text node but was placed in ${openTag.placement}`);
        }
        if (closeTag.placement !== TagPlacement.TextNode) {
            throw new TemplateSyntaxError(`Loop closing tag "${closeTag.rawText}" must be placed in a text node but was placed in ${closeTag.placement}`);
        }
        if (officeMarkup.query.containingStructuredTagContentNode(openTag.xmlTextNode)) {
            throw new TemplateSyntaxError(`Loop tag "${openTag.rawText}" cannot be placed inside a content control`);
        }
        if (officeMarkup.query.containingStructuredTagContentNode(closeTag.xmlTextNode)) {
            throw new TemplateSyntaxError(`Loop tag "${closeTag.rawText}" cannot be placed inside a content control`);
        }

        // Select the suitable strategy
        const loopStrategy = this.loopStrategies.find(strategy => strategy.isApplicable(openTag, closeTag, isCondition));
        if (!loopStrategy)
            throw new Error(`No loop strategy found for tag '${openTag.rawText}'.`);

        // Prepare to loop
        const { firstNode, nodesToRepeat, lastNode } = loopStrategy.splitBefore(openTag, closeTag);

        // Repeat (loop) the content
        const repeatedNodes = this.repeat(nodesToRepeat, value.length);

        // Recursive compilation
        // (this step can be optimized in the future if we'll keep track of the
        // path to each token and use that to create new tokens instead of
        // search through the text again)
        const compiledNodes = await this.compile(isCondition, repeatedNodes, data, context);

        // Merge back to the document
        loopStrategy.mergeBack(compiledNodes, firstNode, lastNode);
    }

    private repeat(nodes: XmlNode[], times: number): XmlNode[][] {
        if (!nodes.length || !times)
            return [];

        const allResults: XmlNode[][] = [];

        for (let i = 0; i < times; i++) {
            const curResult = nodes.map(node => xml.create.cloneNode(node, true));
            allResults.push(curResult);
        }

        return allResults;
    }

    private async compile(isCondition: boolean, nodeGroups: XmlNode[][], data: ScopeData, context: TemplateContext): Promise<XmlNode[][]> {
        const compiledNodeGroups: XmlNode[][] = [];

        // Compile each node group with it's relevant data
        for (let i = 0; i < nodeGroups.length; i++) {

            // Create dummy root node
            const curNodes = nodeGroups[i];
            const dummyRootNode = xml.create.generalNode('dummyRootNode');
            curNodes.forEach(node => xml.modify.appendChild(dummyRootNode, node));

            // Compile the new root
            const conditionTag = this.updatePathBefore(isCondition, data, i);
            await this.utilities.compiler.compile(dummyRootNode, data, context);
            this.updatePathAfter(isCondition, data, conditionTag);

            // Disconnect from dummy root
            const curResult: XmlNode[] = [];
            while (dummyRootNode.childNodes && dummyRootNode.childNodes.length) {
                const child = xml.modify.removeChild(dummyRootNode, 0);
                curResult.push(child);
            }
            compiledNodeGroups.push(curResult);
        }

        return compiledNodeGroups;
    }

    private updatePathBefore(isCondition: boolean, data: ScopeData, groupIndex: number): PathPart {

        // If it's a condition - don't go deeper in the path
        // (so we need to extract the already pushed condition tag)
        if (isCondition) {
            if (groupIndex > 0) {
                // should never happen - conditions should have at most one (synthetic) child...
                throw new Error(`Internal error: Unexpected group index ${groupIndex} for boolean condition at path "${data.pathString()}".`);
            }
            return data.pathPop();
        }

        // Else, it's an array - push the current index
        data.pathPush(groupIndex);
        return null;
    }

    private updatePathAfter(isCondition: boolean, data: ScopeData, conditionTag: PathPart): void {

        // Reverse the "before" path operation
        if (isCondition) {
            data.pathPush(conditionTag);
        } else {
            data.pathPop();
        }
    }
}

