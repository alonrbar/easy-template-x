import { DataBindingTemplatePlugin } from "./dataBindingTemplatePlugin";
import { DataBindingBooleanContent } from "./dataBindingBooleanContent";
import { XmlNode } from "../../../xml";

export class DataBindingBooleanPlugin extends DataBindingTemplatePlugin {
  public get contentType(): string {
    return "boolean";
  }

  public setNodeContents(
    textNode: XmlNode,
    content: DataBindingBooleanContent
  ): void | Promise<void> {
    const contentNode: XmlNode = XmlNode.createTextNode(
      content.value.toString()
    );

    XmlNode.remove(XmlNode.lastTextChild(textNode));
    XmlNode.appendChild(textNode, contentNode);
  }
}
