import { ScopeData, Tag, TemplateContext } from "src/compilation";
import { wml } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { ChartContent } from "./chartContent";

export class ChartPlugin extends TemplatePlugin {

    public readonly contentType = 'chart';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const wordTextNode = wml.query.containingTextNode(tag.xmlTextNode);

        const content = data.getScopeData<ChartContent>();
        if (!content) {
            xml.modify.remove(wordTextNode);
            return;
        }

        xml.modify.remove(wordTextNode);
    }
}
