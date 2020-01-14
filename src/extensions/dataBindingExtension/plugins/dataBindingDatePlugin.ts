import { DataBindingTemplatePlugin } from "./dataBindingTemplatePlugin";
import { DataBindingDateContent } from "./dataBindingDateContent";
import { XmlNode } from "../../../xml";
import { first } from "../../../utils";

export class DataBindingDatePlugin extends DataBindingTemplatePlugin {
    public get contentType(): string {
        return "date";
    }

    public setNodeContents(
        textNode: XmlNode,
        content: DataBindingDateContent
    ): void | Promise<void> {
        const contentNode: XmlNode = XmlNode.createTextNode(
            this.getOOXMLDate(content.value)
        );

        XmlNode.remove(XmlNode.lastTextChild(textNode));
        XmlNode.appendChild(textNode, contentNode);
    }

    private getOOXMLDate(date: Date): string {
        return first(date.toJSON().split("T"));
    }
}
