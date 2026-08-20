import { ScopeData } from "src/compilation/scopeData";
import { Tag, TagPlacement, TextNodeTag } from "src/compilation/tag";
import { TemplateContext } from "src/compilation/templateContext";
import { TemplateSyntaxError } from "src/errors";
import { officeMarkup, OmlNode } from "src/office";
import { TemplatePlugin } from "src/plugins/templatePlugin";
import { xml } from "src/xml";
import { ChartContent } from "./chartContent";
import { updateChart } from "./updateChart";

export class ChartPlugin extends TemplatePlugin {

    public readonly contentType = 'chart';

    public async simpleTagReplacements(tag: Tag, data: ScopeData, context: TemplateContext): Promise<void> {

        if (tag.placement !== TagPlacement.TextNode) {
            throw new TemplateSyntaxError(`Chart tag "${tag.rawText}" must be placed in a text node but was placed in ${tag.placement}`);
        }

        const chartNode = xml.query.findParentByName(tag.xmlTextNode, "c:chart");
        if (!chartNode) {
            throw new TemplateSyntaxError(`Chart tag "${tag.rawText}" must be placed in chart title`);
        }

        const content = data.getScopeData<ChartContent>();
        if (!content) {
            officeMarkup.modify.removeTag(tag);
            return;
        }

        // Replace or remove the tag
        if (content.title) {
            updateTitle(tag, content.title);
        } else {
            officeMarkup.modify.removeTag(tag);
        }

        if (!chartHasData(content)) {
            return;
        }

        // Update the chart
        await updateChart(context.currentPart, content);
    }
}

function updateTitle(tag: TextNodeTag, newTitle: string) {

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
    const originalRun = officeMarkup.query.containingRunNode(newWordTextNode);
    const runTextNodes = originalRun.childNodes.filter(node => officeMarkup.query.isTextNode(node));
    if (runTextNodes.length > 1) {

        // Get all non-empty text nodes
        const nonEmptyTextNodes = runTextNodes.filter(node => !officeMarkup.query.isEmptyTextNode(node));

        // Clear the run
        for (const textNode of runTextNodes) {
            xml.modify.remove(textNode);
        }

        // Create one run per text node
        const emptyRun = xml.create.cloneNode(originalRun, true);
        let curRun = originalRun;
        let prevRun = originalRun;
        for (const textNode of nonEmptyTextNodes) {

            // Add one text node to the current run
            xml.modify.appendChild(curRun, textNode);

            // Insert the current run after the previous run
            if (curRun !== prevRun) {
                xml.modify.insertAfter(curRun, prevRun);
            }

            // Advance the loop variables
            prevRun = curRun;
            curRun = xml.create.cloneNode(emptyRun, true);
        }
    }
}

function chartHasData(content: ChartContent) {
    return !!content?.series?.length;
}
