import { ScopeData, Tag, TemplateContext } from "src/compilation";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup, OmlNode } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { ChartContent } from "./chartContent";
import { updateChart } from "./updateChart";

export class ChartPlugin extends TemplatePlugin {

    public readonly contentType = 'chart';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        const chartNode = xml.query.findParentByName(tag.xmlTextNode, "c:chart");
        if (!chartNode) {
            throw new TemplateSyntaxError("Chart tag not placed in chart title");
        }

        const content = data.getScopeData<ChartContent>();
        if (!content) {
            officeMarkup.modify.removeTag(tag.xmlTextNode);
            return;
        }

        // Replace or remove the tag
        if (content.title) {
            updateTitle(tag, content.title);
        } else {
            officeMarkup.modify.removeTag(tag.xmlTextNode);
        }

        if (!chartHasData(content)) {
            return;
        }

        // Update the chart
        await updateChart(context.currentPart, content);
    }
}

function updateTitle(tag: Tag, newTitle: string) {

    const wordTextNode = officeMarkup.query.containingTextNode(tag.xmlTextNode);

    // Create the new title node
    const newXmlTextNode = xml.create.textNode(newTitle);
    const newWordTextNode = xml.create.generalNode(OmlNode.A.Text, {
        childNodes: [
            newXmlTextNode
        ]
    });
    xml.modify.insertAfter(newWordTextNode, wordTextNode);

    // Remove the tag node
    xml.modify.remove(wordTextNode);

    // Split the run if needed.
    // Chart title run node can only have one text node
    const curRun = officeMarkup.query.containingRunNode(newWordTextNode);
    const runTextNodes = curRun.childNodes.filter(node => officeMarkup.query.isTextNode(node));
    if (runTextNodes.length > 1) {

        // Remove the last text node
        const lastTextNode = runTextNodes[runTextNodes.length - 1];
        xml.modify.remove(lastTextNode);

        // Create a new run
        const newRun = xml.create.cloneNode(curRun, true);
        for (const node of newRun.childNodes) {
            if (officeMarkup.query.isTextNode(node)) {
                xml.modify.remove(node);
            }
        }
        xml.modify.insertAfter(newRun, curRun);

        // Add the text node to the new run
        xml.modify.appendChild(newRun, lastTextNode);
    }
}

function chartHasData(content: ChartContent) {
    return !!content?.series?.length;
}
