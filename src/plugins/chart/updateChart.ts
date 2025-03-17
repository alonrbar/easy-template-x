import { ArgumentError } from "src/errors";
import { Docx, XmlPart } from "src/office";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";

// Based on: https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/ChartUpdater.cs

export interface ChartData {
    seriesNames: string[];

    categoryDataType: ChartDataType;
    categoryFormatCode: string;
    categoryNames: string[];

    values: number[][];
}

export type ChartDataType = 'number' | 'string' | 'dateTime';

const chartTypes = Object.freeze({
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

    const chartNode = plotAreaNode.childNodes?.find(child => chartTypes[child.nodeName as keyof typeof chartTypes]) as XmlGeneralNode;
    if (!chartNode) {
        const plotAreaChildren = plotAreaNode.childNodes?.map(child => `<${child.nodeName}>`);
        const supportedChartTypes = Object.keys(chartTypes).join(", ");
        throw new Error(`Unsupported chart type. Plot area children: ${plotAreaChildren?.join(", ")}. Supported chart types: ${supportedChartTypes}`);
    }

    updateSeries(chartPart, chartNode, chartData);
}

function updateSeries(chartPart: XmlPart, chartNode: XmlNode, chartData: ChartData) {
    // TODO: Update embedded workbook

    // Remove all old series
    chartNode.childNodes = chartNode.childNodes?.filter(child => child.nodeName === "c:ser");

    // Create new series
    const firstSeries = readFirstSeries(chartNode);
    const newSeries = chartData.seriesNames.map((name, index) => createSeries(name, index, firstSeries, chartData));
    chartNode.childNodes = [...chartNode.childNodes, ...newSeries];
}

//
// Read the first series
//

interface FirstSeriesData {
    sheetName: string;
    shapePropertiesMarkup: string;
    chartExtensibilityMarkup: string;
    chartSpecificMarkup: string;
}

function readFirstSeries(chartNode: XmlNode): FirstSeriesData {
    const chartType = chartNode.nodeName;

    const firstSeries = chartNode.childNodes?.find(child => child.nodeName === "c:ser");
    if (!firstSeries) {
        throw new ArgumentError("First series not found. Please include at least one series in the placeholder chart.");
    }

    return {
        sheetName: getSheetName(firstSeries),
        shapePropertiesMarkup: xml.parser.serializeNode(firstSeries.childNodes?.find(child => child.nodeName === "c:spPr")),
        chartExtensibilityMarkup: xml.parser.serializeNode(firstSeries.childNodes?.find(child => child.nodeName === "c:extLst")),
        chartSpecificMarkup: chartSpecificMarkup(chartType, firstSeries),
    };
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

function chartSpecificMarkup(chartType: string, firstSeries: XmlNode): string {
    if (chartType == chartTypes.area3DChart || chartType == chartTypes.areaChart) {

        const pictureOptions = firstSeries.childNodes?.find(child => child.nodeName === "c:pictureOptions");
        const dPt = firstSeries.childNodes?.find(child => child.nodeName === "c:dPt");
        const dLbls = firstSeries.childNodes?.find(child => child.nodeName === "c:dLbls");
        const trendline = firstSeries.childNodes?.find(child => child.nodeName === "c:trendline");
        const errBars = firstSeries.childNodes?.find(child => child.nodeName === "c:errBars");

        return `
            ${xml.parser.serializeNode(pictureOptions)}
            ${xml.parser.serializeNode(dPt)}
            ${xml.parser.serializeNode(dLbls)}
            ${xml.parser.serializeNode(trendline)}
            ${xml.parser.serializeNode(errBars)}
        `;
    }

    if (chartType == chartTypes.bar3DChart || chartType == chartTypes.barChart) {

        const invertIfNegative = firstSeries.childNodes?.find(child => child.nodeName === "c:invertIfNegative");
        const pictureOptions = firstSeries.childNodes?.find(child => child.nodeName === "c:pictureOptions");
        const dPt = firstSeries.childNodes?.find(child => child.nodeName === "c:dPt");
        const dLbls = firstSeries.childNodes?.find(child => child.nodeName === "c:dLbls");
        const trendline = firstSeries.childNodes?.find(child => child.nodeName === "c:trendline");
        const errBars = firstSeries.childNodes?.find(child => child.nodeName === "c:errBars");

        return `
            ${xml.parser.serializeNode(invertIfNegative)}
            ${xml.parser.serializeNode(pictureOptions)}
            ${xml.parser.serializeNode(dPt)}
            ${xml.parser.serializeNode(dLbls)}
            ${xml.parser.serializeNode(trendline)}
            ${xml.parser.serializeNode(errBars)}
        `;
    }

    if (chartType == chartTypes.line3DChart || chartType == chartTypes.lineChart || chartType == chartTypes.stockChart) {
        const marker = firstSeries.childNodes?.find(child => child.nodeName === "c:marker");
        const dPt = firstSeries.childNodes?.find(child => child.nodeName === "c:dPt");
        const dLbls = firstSeries.childNodes?.find(child => child.nodeName === "c:dLbls");
        const trendline = firstSeries.childNodes?.find(child => child.nodeName === "c:trendline");
        const errBars = firstSeries.childNodes?.find(child => child.nodeName === "c:errBars");
        const smooth = firstSeries.childNodes?.find(child => child.nodeName === "c:smooth");

        return `
            ${xml.parser.serializeNode(marker)}
            ${xml.parser.serializeNode(dPt)}
            ${xml.parser.serializeNode(dLbls)}
            ${xml.parser.serializeNode(trendline)}
            ${xml.parser.serializeNode(errBars)}
            ${xml.parser.serializeNode(smooth)}
        `;
    }

    if (chartType == chartTypes.doughnutChart || chartType == chartTypes.ofPieChart || chartType == chartTypes.pie3DChart || chartType == chartTypes.pieChart) {
        const explosion = firstSeries.childNodes?.find(child => child.nodeName === "c:explosion");
        const dPt = firstSeries.childNodes?.find(child => child.nodeName === "c:dPt");
        const dLbls = firstSeries.childNodes?.find(child => child.nodeName === "c:dLbls");

        return `
            ${xml.parser.serializeNode(explosion)}
            ${xml.parser.serializeNode(dPt)}
            ${xml.parser.serializeNode(dLbls)}
        `;
    }

    if (chartType == chartTypes.surface3DChart || chartType == chartTypes.surfaceChart) {
        return "";
    }

    throw new Error(`Unsupported chart type: ${chartType}`);
}

//
// Create a new series
//

function createSeries(seriesName: string, seriesIndex: number, firstSeries: FirstSeriesData, chartData: ChartData): XmlNode {

    const title = titleMarkup(seriesName, seriesIndex, firstSeries.sheetName);
    const categories = categoriesMarkup(chartData, firstSeries.sheetName);
    const values = valuesMarkup(seriesIndex, chartData, firstSeries.sheetName);

    const series = parseXmlNode(`
        <c:ser>
            <c:idx val="${seriesIndex}"/>
            <c:order val="${seriesIndex}"/>
            ${title}
            ${firstSeries.shapePropertiesMarkup}
            ${firstSeries.chartSpecificMarkup}
            ${categories}
            ${values}
            ${firstSeries.chartExtensibilityMarkup}
        </c:ser>
    `);

    const accentNumber = (seriesIndex % 6) + 1;
    updateAccentTransform(series, accentNumber);

    return series;
}

function titleMarkup(seriesName: string, seriesIndex: number, sheetName: string): string {
    if (!sheetName) {
        return `
            <c:tx>
                <c:v>${seriesName}</c:v>
            </c:tx>
        `;
    }

    const formula = `${sheetName}!$${intToColumnId(seriesIndex + 1)}$1`;
    return `
        <c:tx>
            <c:strRef>
                <c:f>${formula}</c:f>
                <c:strCache>
                    <c:ptCount val="1"/>
                    <c:pt idx="0">
                        <c:v>${seriesName}</c:v>
                    </c:pt>
                </c:strCache>
            </c:strRef>
        </c:tx>
    `;
}

function categoriesMarkup(chartData: ChartData, sheetName: string): string {

    const ptNodes = `
        <c:ptCount val="${chartData.categoryNames.length}"/>
        ${chartData.categoryNames.map((name, index) => `
            <c:pt idx="${index}">
                <c:v>${name}</c:v>
            </c:pt>
        `).join("\n")}
    `;

    if (sheetName) {

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

function valuesMarkup(seriesIndex: number, chartData: ChartData, sheetName: string): string {
    if (!sheetName) {
        return `
            <c:val>
                <c:numLit>
                    <c:ptCount val="${chartData.categoryNames.length}" />
                    ${chartData.categoryNames.map((name, catIndex) => `
                        <c:pt idx="${catIndex}">
                            <c:v>${chartData.values[seriesIndex][catIndex]}</c:v>
                        </c:pt>
                    `).join("\n")}
                </c:numLit>
            </c:val>
        `;
    }

    const columnId = intToColumnId(seriesIndex + 1);
    const formula = `${sheetName}!$${columnId}$2:$${columnId}$${chartData.categoryNames.length + 1}`;
    return `
        <c:val>
            <c:numRef>
                <c:f>${formula}</c:f>
                <c:numCache>
                    <c:formatCode>${chartData.categoryFormatCode}</c:formatCode>
                    <c:ptCount val="${chartData.categoryNames.length}" />
                        ${chartData.categoryNames.map((name, catIndex) => `
                            <c:pt idx="${catIndex}">
                                <c:v>${chartData.values[seriesIndex][catIndex]}</c:v>
                        </c:pt>
                    `).join("\n")}
                </c:numCache>
            </c:numRef>
        </c:val>
    `;
}

function updateAccentTransform(node: XmlNode, accentNumber: number) {
    if (!node) {
        return;
    }

    if (node.nodeName == "a:schemeClr" && node.attributes?.["val"] == "accent1") {
        node.attributes["val"] = `accent${accentNumber}`;
        return;
    }

    for (const child of node.childNodes) {
        updateAccentTransform(child, accentNumber);
    }
}

function parseXmlNode(xmlString: string): XmlNode {
    const xmlNode = xml.parser.parse(xmlString);
    xml.modify.removeEmptyTextNodes(xmlNode);
    return xmlNode;
}

function intToColumnId(i: number): string {

    // From: https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/PtOpenXmlUtil.cs#L1559

    const A = 65;

    if (i >= 0 && i <= 25) {
        return String.fromCharCode(A + i);
    }
    if (i >= 26 && i <= 701) {
        const v = i - 26;
        const h = Math.floor(v / 26);
        const l = v % 26;
        return String.fromCharCode(A + h) + String.fromCharCode(A + l);
    }
    // 17576
    if (i >= 702 && i <= 18277) {
        const v = i - 702;
        const h = Math.floor(v / 676);
        const r = v % 676;
        const m = Math.floor(r / 26);
        const l = r % 26;
        return String.fromCharCode(A + h) + String.fromCharCode(A + m) + String.fromCharCode(A + l);
    }
    throw new Error(`Column reference out of range: ${i}`);
}