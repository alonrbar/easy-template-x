import { ArgumentError } from "src/errors";
import { OpenXmlPart, WmlAttribute, Xlsx } from "src/office";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";

// Based on: https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/ChartUpdater.cs

export interface ChartData {
    seriesNames: string[];

    categoryDataType: ChartDataType;
    categoryFormatCode: FormatCode;
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

// https://support.microsoft.com/en-us/office/number-format-codes-in-excel-for-mac-5026bbd6-04bc-48cd-bf33-80f18b4eae68
export const formatCodes = Object.freeze([
    "General",
    "0",
    "0.00",
    "#,##0",
    "#,##0.00",
    "0%",
    "0.00%",
    "0.00E+00",
    "# ?/?",
    "# ??/?",
    "mm-dd-yy",
    "d-mmm-yy",
    "d-mmm",
    "mmm-yy",
    "h:mm AM/PM",
    "h:mm:ss AM/PM",
    "h:mm",
    "h:mm:ss",
    "m/d/yy h:mm",
    "#,##0 ;(#,##0)",
    "#,##0 ;[Red](#,##0)",
    "#,##0.00;(#,##0.00)",
    "#,##0.00;[Red](#,##0.00)",
    "mm:ss",
    "[h]:mm:ss",
    "mmss.0",
    "##0.0E+0",
    "@"
] as const);

export type FormatCode = typeof formatCodes[number];

export async function updateChart(chartPart: OpenXmlPart, chartData: ChartData) {

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

    // Read the first series
    const firstSeries = readFirstSeries(chartNode);

    // Update embedded worksheet
    await updateEmbeddedExcelFile(chartPart, firstSeries.sheetName, chartData);

    // Update inline series
    updateInlineSeries(chartNode, firstSeries, chartData);
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
// Update inline series
//

function updateInlineSeries(chartNode: XmlNode, firstSeries: FirstSeriesData, chartData: ChartData) {

    // Remove all old series
    const seriesNodes = chartNode.childNodes?.filter(child => child.nodeName === "c:ser");
    for (const seriesNode of seriesNodes) {
        xml.modify.removeChild(chartNode, seriesNode);
    }

    // Create new series
    const newSeries = chartData.seriesNames.map((name, index) => createSeries(name, index, firstSeries, chartData));
    for (const series of newSeries) {
        xml.modify.appendChild(chartNode, series);
    }
}

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
    updateAccentNumber(series, accentNumber);

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

    const formula = `${sheetName}!$${excelColumnId(seriesIndex + 1)}$1`;
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

    const columnId = excelColumnId(seriesIndex + 1);
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

function updateAccentNumber(node: XmlNode, accentNumber: number) {
    if (!node) {
        return;
    }

    if (node.nodeName == "a:schemeClr" && node.attributes?.["val"] == "accent1") {
        node.attributes["val"] = `accent${accentNumber}`;
        return;
    }

    for (const child of node.childNodes) {
        updateAccentNumber(child, accentNumber);
    }
}

function parseXmlNode(xmlString: string): XmlNode {
    const xmlNode = xml.parser.parse(xmlString);
    xml.modify.removeEmptyTextNodes(xmlNode);
    return xmlNode;
}

//
// Update the embedded Excel workbook file
//

async function updateEmbeddedExcelFile(chartPart: OpenXmlPart, sheetName: string, chartData: ChartData) {

    // Get the relation ID of the embedded Excel file
    const rootNode = await chartPart.xmlRoot();
    const externalDataNode = rootNode.childNodes?.find(child => child.nodeName === "c:externalData") as XmlGeneralNode;
    const workbookRelId = externalDataNode?.attributes["r:id"];
    if (!workbookRelId) {
        return;
    }

    // Open the embedded Excel file
    const xlsxPart = await chartPart.getPartById(workbookRelId);
    if (!xlsxPart) {
        return;
    }
    const xlsxBinary = await xlsxPart.getContentBinary();
    const xlsx = await Xlsx.load(xlsxBinary);

    // Update the workbook
    const workbookPart = xlsx.mainDocument;
    const sheetPart = await updateSheetPart(workbookPart, sheetName, chartData);
    if (sheetPart) {
        await updateTablePart(sheetPart, chartData);
    }
    await workbookPart.saveXmlChanges();

    // Save the Excel file
    const newXlsxBinary = await xlsx.export();
    await xlsxPart.saveBinaryChanges(newXlsxBinary);
}

async function updateSheetPart(workbookPart: OpenXmlPart, sheetName: string, chartData: ChartData): Promise<OpenXmlPart> {

    // Get the sheet rel ID
    const root = await workbookPart.xmlRoot();
    const sheetNode = root.childNodes?.
        find(child => child.nodeName === "sheets")?.childNodes?.
        find(child => child.nodeName === "sheet" && child.attributes["name"] == sheetName) as XmlGeneralNode;
    const sheetRelId = sheetNode?.attributes["r:id"];
    if (!sheetRelId) {
        return null;
    }

    // Get the sheet part
    const sheetPart = await workbookPart.getPartById(sheetRelId);
    if (!sheetPart) {
        return null;
    }
    const sheetRoot = await sheetPart.xmlRoot();

    // TODO: AddDxfToDxfs

    const firstRow = `
        <row>
            <c r="1" spans="1:${chartData.seriesNames.length + 1}">
                <c r="A1" t="str" ${WmlAttribute.SpacePreserve}="preserve">
                    <v> </v>
                </c>
                ${chartData.seriesNames.map((name, index) => `
                    <c r="${excelRowAndColumnId(0, index + 1)}" t="str">
                        <v>${name}</v>
                    </c>
                `).join("\n")}
            </c>
        </row>
    `;

    // TODO: Add style for category
    const categoryStyleId = "";
    const categoryDataType = chartData.categoryDataType === "string" ? `t="str"` : "";
    const otherRows = chartData.categoryNames.map((name, rowIndex) => `
        <row r="${rowIndex + 2}" spans="1:${chartData.seriesNames.length + 1}">
            <c r="${excelRowAndColumnId(rowIndex + 1, 0)}" ${categoryDataType} ${categoryStyleId}>
                <v>${name}</v>
            </c>
            ${chartData.values.map((columnValues, columnIndex) => `
                <c r="${excelRowAndColumnId(rowIndex + 1, columnIndex + 1)}">
                    <v>${columnValues[rowIndex]}</v>
                </c>
            `).join("\n")}
        </row>
    `);

    // Replace sheet data
    const sheetDataNode = sheetRoot.childNodes?.find(child => child.nodeName === "sheetData");
    for (const child of sheetDataNode.childNodes) {
        xml.modify.removeChild(sheetDataNode, child);
    }
    xml.modify.appendChild(sheetDataNode, parseXmlNode(firstRow));
    for (const row of otherRows) {
        xml.modify.appendChild(sheetDataNode, parseXmlNode(row));
    }

    // Save the sheet part
    await sheetPart.saveXmlChanges();

    return sheetPart;
}

async function updateTablePart(sheetPart: OpenXmlPart, chartData: ChartData) {

    const sheetRoot = await sheetPart.xmlRoot();

    // Get the table part
    const tablePartNode = sheetRoot.
        childNodes?.find(child => child.nodeName === "tableParts")?.
        childNodes?.find(child => child.nodeName === "tablePart") as XmlGeneralNode;
    const tablePartId = tablePartNode?.attributes["r:id"];
    if (!tablePartId) {
        return;
    }
    const tablePart = await sheetPart.getPartById(tablePartId);
    if (!tablePart) {
        return;
    }

    // Update the table part
    const tablePartRoot = await tablePart.xmlRoot() as XmlGeneralNode;
    tablePartRoot.attributes["ref"] = `A1:${excelRowAndColumnId(chartData.categoryNames.length - 1, chartData.seriesNames.length)}`;

    // Remove old table columns
    const tableColumnsNode = tablePartRoot.childNodes?.find(child => child.nodeName === "tableColumns");
    xml.modify.removeChild(tablePartRoot, tableColumnsNode);

    // Add new table columns
    const tableColumns = `
        <tableColumns count="${chartData.seriesNames.length + 1}">
            <tableColumn id="1" name=" "/>
            ${chartData.seriesNames.map((name, index) => `
                <tableColumn id="${index + 2}" name="${name}"/>
            `).join("\n")}
        </tableColumns>
    `;
    xml.modify.appendChild(tablePartRoot, parseXmlNode(tableColumns));

    // Save the table part
    await tablePart.saveXmlChanges();
}

//
// Helper functions
//

function excelColumnId(i: number): string {

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

function excelRowAndColumnId(row: number, col: number): string {
    return excelColumnId(col) + (row + 1).toString();
}
