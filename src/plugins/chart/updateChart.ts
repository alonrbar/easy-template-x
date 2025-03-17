import { ArgumentError } from "src/errors";
import { Docx, XmlPart } from "src/office";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";

export interface ChartData {
    seriesNames: string[];

    categoryDataType: ChartDataType;
    categoryFormatCode: string;
    categoryNames: string[];

    values: number[][];
}

export type ChartDataType = 'number' | 'string' | 'dateTime';

const chartType = Object.freeze({
    area3DChart: "c:area3DChart",
    areaChart: "c:areaChart",
    bar3DChart: "c:bar3DChart",
    barChart: "c:barChart",
    line3DChart: "c:line3DChart",
    lineChart: "c:lineChart",
    stockChart: "c:stockChart",
    doughnutChart: "c:doughnutChart",
    ofPieChart: "c:ofPieChart",
    pie3DChart: "c:pie3DChart",
    pieChart: "c:pieChart",
    surface3DChart: "c:surface3DChart",
    surfaceChart: "c:surfaceChart",
} as const);

// Format Codes
// 0 - General
// 1 - 0
// 2 - 0.00
// 3 - #,##0
// 4 - #,##0.00
// 9 - 0%
// 10 - 0.00%
// 11 - 0.00E+00
// 12 - # ?/?
// 13 - # ??/??
// 14 - mm-dd-yy
// 15 - d-mmm-yy
// 16 - d-mmm
// 17 - mmm-yy
// 18 - h:mm AM/PM
// 19 - h:mm:ss AM/PM
// 20 - h:mm
// 21 - h:mm:ss
// 22 - m/d/yy h:mm
// 37 - #,##0 ;(#,##0)
// 38 - #,##0 ;[Red](#,##0)
// 39 - #,##0.00;(#,##0.00)
// 40 - #,##0.00;[Red](#,##0.00)
// 45 - mm:ss
// 46 - [h]:mm:ss
// 47 - mmss.0
// 48 - ##0.0E+0
// 49 - @

export async function updateChart(doc: Docx, chartPart: XmlPart, chartData: ChartData) {

    // Input validation
    if (chartData.values.length != chartData.seriesNames.length) {
        throw new Error("Invalid chart data. Values and series names must have the same length.");
    }
    for (const ser of chartData.values) {
        if (ser.length != chartData.categoryNames.length) {
            throw new Error("Invalid chart data. Series values and category names must have the same length.");
        }
    }

    // Get the chart node
    const root = await chartPart.xmlRoot();
    if (root.nodeName !== "c:chartSpace") {
        throw new Error(`Unexpected chart root node "${root.nodeName}"`);
    }

    const chartWrapperNode = root.childNodes?.find(child => child.nodeName === "c:chart");
    if (!chartWrapperNode) {
        throw new Error("Chart node not found");
    }

    const plotAreaNode = chartWrapperNode.childNodes?.find(child => child.nodeName === "c:plotArea");
    if (!plotAreaNode) {
        throw new Error("Plot area node not found");
    }

    const chartNode = plotAreaNode.childNodes?.find(child => chartType[child.nodeName as keyof typeof chartType]) as XmlGeneralNode;
    if (!chartNode) {
        const plotAreaChildren = plotAreaNode.childNodes?.map(child => `<${child.nodeName}>`);
        const supportedChartTypes = Object.keys(chartType).join(", ");
        throw new Error(`Unsupported chart type. Plot area children: ${plotAreaChildren?.join(", ")}. Supported chart types: ${supportedChartTypes}`);
    }

    updateSeries(chartPart, chartNode, chartData);
}

function updateSeries(chartPart: XmlPart, chartNode: XmlNode, chartData: ChartData) {
    // TODO: Update embedded workbook

    const chartType = chartNode.nodeName;

    const firstSeries = chartNode.childNodes?.find(child => child.nodeName === "c:ser");
    if (!firstSeries) {
        throw new ArgumentError("First series not found. Please include at least one series in the placeholder chart.");
    }

    const numRef = firstSeries?.
        childNodes?.find(child => child.nodeName === "c:val")?.
        childNodes?.find(child => child.nodeName === "c:numRef");

    const sheetName = getSheetName(firstSeries);

    // Remove all old series
    chartNode.childNodes = chartNode.childNodes?.filter(child => child.nodeName === "c:ser");

    // Create new series
    const newSeries = chartData.seriesNames.map(name => createSeries(chartPart, chartNode, name, chartData));
    chartNode.childNodes = [...chartNode.childNodes, ...newSeries];
}

function getSheetName(firstSeries: XmlNode): string {
    const formulaNode = firstSeries?.
        childNodes?.find(child => child.nodeName === "c:tx").
        childNodes?.find(child => child.nodeName === "c:strRef").
        childNodes?.find(child => child.nodeName === "c:f");
    const formula = xml.query.lastTextChild(formulaNode, false);
    if (!formula) {
        return null;
    }

    return formula.textContent?.split('!')[0];
}

function createSeries(chartPart: XmlPart, chartNode: XmlNode, name: string, chartData: ChartData): XmlNode {
    const firstSeries = chartNode.childNodes?.find(child => child.nodeName === "c:ser");
    if (!firstSeries) {
        throw new Error("First series not found");
    }

    const sheetName = getSheetName(firstSeries);

    const oldCategories = firstSeries.childNodes?.find(child => child.nodeName === "c:cat");
    if (!oldCategories) {
        throw new ArgumentError("Invalid chart markup. Series categories node not found. Please include at least one series in the placeholder chart.");
    }
    const newCategories = categoriesMarkup(oldCategories, chartData, sheetName);

    const series = xml.create.generalNode("c:ser");
    series.childNodes = [newCategories];

    return series;
}

function categoriesMarkup(oldCategories: XmlNode, chartData: ChartData, sheetName: string): string {

    const ptNodes = `
        <c:ptCount val="${chartData.categoryNames.length}"/>
        ${chartData.categoryNames.map((name, index) => `
            <c:pt idx="${index}">
                <c:v>${name}</c:v>
            </c:pt>
        `).join("\n")}
    `;

    const hasFormula = oldCategories.childNodes?.some(child => child?.childNodes?.some(c => c.nodeName === "c:f"));
    if (hasFormula) {

        const formula = `${sheetName}!$A$2:$A$${chartData.categoryNames.length + 1}`;

        // String reference
        if (chartData.categoryDataType == "string") {
            return `
                <c:cat>
                    <c:strRef>
                        <c:f>${formula}</c:f>
                        <c:strCache>
                            ${ptNodes}
                        </c:strCache>
                    </c:strRef>
                </c:cat>
            `;
        }

        // Number reference
        return `
            <c:cat>
                <c:numRef>
                    <c:f>${formula}</c:f>
                    <c:numCache>
                        <c:formatCode>${chartData.categoryFormatCode}</c:formatCode>
                        ${ptNodes}
                    </c:numCache>
                </c:numRef>
            </c:cat>
        `;
    }

    // String literal
    if (chartData.categoryDataType == "string") {
        return `
            <c:cat>
                <c:strLit>
                    ${ptNodes}
                </c:strLit>
            </c:cat>
        `;
    }

    // Number literal
    return `
        <c:cat>
            <c:numLit>
                ${ptNodes}
            </c:numLit>
        </c:cat>
    `;
}

function parseXmlNode(xmlString: string): XmlNode {
    const xmlNode = xml.parser.parse(xmlString);
    xml.modify.removeEmptyTextNodes(xmlNode);
    return xmlNode;
}
