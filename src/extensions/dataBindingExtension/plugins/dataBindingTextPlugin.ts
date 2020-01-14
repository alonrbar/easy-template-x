import { DataBindingTemplatePlugin } from "./dataBindingTemplatePlugin";
import { DataBindingTextContent } from "./dataBindingTextContent";
import { XmlNode } from "../../../xml";

export class DataBindingTextPlugin extends DataBindingTemplatePlugin {
  public get contentType(): string {
    return "text";
  }

  public setNodeContents(
    textNode: XmlNode,
    content: DataBindingTextContent
  ): void | Promise<void> {
    const contentNode: XmlNode = XmlNode.createTextNode(content.value);

    XmlNode.remove(XmlNode.lastTextChild(textNode));
    XmlNode.appendChild(textNode, contentNode);
  }
}
