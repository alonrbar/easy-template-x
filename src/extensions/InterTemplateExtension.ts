import { IExtensionUtilities } from "./IExtensionUtilities";
import { TemplateContext } from "../compilation";
import { ScopeData } from "../compilation";
import { XmlNode } from "src";

export interface ITemplateExtension {
    getXmlDocuments(
        templateContext: TemplateContext
    ): Promise<Map<string, XmlNode>>;
    execute(
        utilities: IExtensionUtilities,
        data: ScopeData,
        context: TemplateContext
    ): void | Promise<void>;
}
