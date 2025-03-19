import { ScopeData, Tag, TemplateContext } from "src/compilation";
import { ArgumentError } from "src/errors";
import { oml } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { ChartContent } from "./chartContent";
import { updateChart } from "./updateChart";

export class ChartPlugin extends TemplatePlugin {

    public readonly contentType = 'chart';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const chartNode = xml.query.findParentByName(tag.xmlTextNode, "c:chart");
        if (!chartNode) {
            throw new ArgumentError("Chart tag not placed on a chart");
        }

        // Remove the tag text
        const wordTextNode = oml.query.containingTextNode(tag.xmlTextNode);
        xml.modify.remove(wordTextNode);

        const content = data.getScopeData<ChartContent>();
        if (!content) {
            return;
        }

        // Update the chart
        await updateChart(context.currentPart, content);
    }
}
