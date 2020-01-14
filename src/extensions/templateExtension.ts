import { TemplateContext, ScopeData } from "../compilation";
import { ITemplateExtension } from "./ITemplateExtension";
import { IExtensionUtilities } from "./IExtensionUtilities";
import { XmlDepthTracker, XmlNode } from "../xml";
import { toDictionary } from "../utils";
import { ITemplatePlugin } from "./ITemplatePlugin";
import { IMap } from "../../src/types";

/* eslint-disable @typescript-eslint/member-ordering */

export abstract class TemplateExtension implements ITemplateExtension {
    protected utilities: IExtensionUtilities;
    private readonly plugins: ITemplatePlugin[];
    protected readonly pluginsLookup: IMap<ITemplatePlugin>;

    public maxXmlDepth = 20;

    public abstract isMatch(node: XmlNode): boolean;
    public abstract updateNode(node: XmlNode, data: ScopeData): void;
    public abstract getXmlDocuments(
        templateContext: TemplateContext
    ): Promise<Map<string, XmlNode>>;

    constructor(plugins: ITemplatePlugin[]) {
        this.plugins = plugins;
        this.pluginsLookup = toDictionary(plugins, p => p.contentType);
    }

    public async execute(
        utilities: IExtensionUtilities,
        data: ScopeData,
        context: TemplateContext
    ) {
        this.utilities = utilities;
        this.setUtilities(this.utilities);

        const documents = await this.getXmlDocuments(context);

        documents.forEach(document => {
            const nodes = this.findNodes(document);

            nodes.forEach(node => this.updateNode(node, data));
        });
    }

    public setUtilities(utilities: IExtensionUtilities): void {
        this.plugins.forEach(plugin => {
            plugin.setUtilities(this.utilities);
        });
    }

    protected findNodes(node: XmlNode): XmlNode[] {
        const nodes: XmlNode[] = [];
        const depth = new XmlDepthTracker(this.maxXmlDepth);

        while (node) {
            if (this.isMatch(node)) {
                nodes.push(node);
            }

            node = this.findNextNode(node, depth);
        }

        return nodes;
    }

    protected findNextNode(node: XmlNode, depth: XmlDepthTracker): XmlNode {
        // children
        if (node.childNodes && node.childNodes.length) {
            depth.increment();
            return node.childNodes[0];
        }

        // siblings
        if (node.nextSibling) return node.nextSibling;

        // parent sibling
        while (node.parentNode) {
            if (node.parentNode.nextSibling) {
                depth.decrement();
                return node.parentNode.nextSibling;
            }

            // go up
            depth.decrement();
            node = node.parentNode;
        }

        return null;
    }
}
