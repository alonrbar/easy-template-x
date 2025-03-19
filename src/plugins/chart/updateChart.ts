import { ArgumentError } from "src/errors";
import { OmlAttribute, OpenXmlPart, RelType, Xlsx } from "src/office";
import { IMap } from "src/types";
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

// TODO: Reverse the format codes
// https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.spreadsheet.numberingformat?view=openxml-3.0.1
// https://support.microsoft.com/en-us/office/number-format-codes-in-excel-for-mac-5026bbd6-04bc-48cd-bf33-80f18b4eae68
export const formatCodes = Object.freeze({
    0: "General",
    1: "0",
    2: "0.00",
    3: "#,##0",
    4: "#,##0.00",
    9: "0%",
    10: "0.00%",
    11: "0.00E+00",
    12: "# ?/?",
    13: "# ??/?",
    14: "mm-dd-yy",
    15: "d-mmm-yy",
    16: "d-mmm",
    17: "mmm-yy",
    18: "h:mm AM/PM",
    19: "h:mm:ss AM/PM",
    20: "h:mm",
    21: "h:mm:ss",
    22: "m/d/yy h:mm",
    37: "#,##0 ;(#,##0)",
    38: "#,##0 ;[Red](#,##0)",
    39: "#,##0.00;(#,##0.00)",
    40: "#,##0.00;[Red](#,##0.00)",
    45: "mm:ss",
    46: "[h]:mm:ss",
    47: "mmss.0",
    48: "##0.0E+0",
    49: "@"
});

export type FormatCode = keyof typeof formatCodes;

const space = " ";

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

    const chartNode = plotAreaNode.childNodes?.find(child => Object.values(chartTypes).includes(child.nodeName as any)) as XmlGeneralNode;
    if (!chartNode) {
        const plotAreaChildren = plotAreaNode.childNodes?.map(child => `<${child.nodeName}>`);
        const supportedChartTypes = Object.values(chartTypes).join(", ");
        throw new Error(`Unsupported chart type. Plot area children: ${plotAreaChildren?.join(", ")}. Supported chart types: ${supportedChartTypes}`);
    }

    // Read the first series
    const firstSeries = readFirstSeries(chartNode, chartData);

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
    chartSpecificMarkup: string;
    categoriesMarkup: string;
    chartExtensibilityMarkup: string;
}

function readFirstSeries(chartNode: XmlNode, chartData: ChartData): FirstSeriesData {
    const chartType = chartNode.nodeName;

    const firstSeries = chartNode.childNodes?.find(child => child.nodeName === "c:ser");
    if (!firstSeries) {
        throw new ArgumentError("First series not found. Please include at least one series in the placeholder chart.");
    }

    const sheetName = getSheetName(firstSeries);

    return {
        sheetName,
        shapePropertiesMarkup: xml.parser.serializeNode(firstSeries.childNodes?.find(child => child.nodeName === "c:spPr")),
        chartSpecificMarkup: chartSpecificMarkup(chartType, firstSeries),
        categoriesMarkup: categoriesMarkup(chartData, sheetName),
        chartExtensibilityMarkup: xml.parser.serializeNode(firstSeries.childNodes?.find(child => child.nodeName === "c:extLst")),
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

function categoriesMarkup(chartData: ChartData, sheetName: string): string {

    const ptNodes = `
        <c:ptCount val="${chartData.categoryNames.length}"/>
        ${chartData.categoryNames.map((name, index) => `
            <c:pt idx="${index}">
                <c:v>${name}</c:v>
            </c:pt>
        `).join("\n")}
    `;

    if (!sheetName) {

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
                    <c:formatCode>${formatCodes[chartData.categoryFormatCode]}</c:formatCode>
                    ${ptNodes}
                </c:numCache>
            </c:numRef>
        </c:cat>
    `;
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
    xml.modify.removeChildren(chartNode, child => child.nodeName === "c:ser");

    // Create new series
    const newSeries = chartData.seriesNames.map((name, index) => createSeries(name, index, firstSeries, chartData));
    for (const series of newSeries) {
        xml.modify.appendChild(chartNode, series);
    }
}

function createSeries(seriesName: string, seriesIndex: number, firstSeries: FirstSeriesData, chartData: ChartData): XmlNode {

    const title = titleMarkup(seriesName, seriesIndex, firstSeries.sheetName);
    const values = valuesMarkup(seriesIndex, chartData, firstSeries.sheetName);

    const series = parseXmlNode(`
        <c:ser>
            <c:idx val="${seriesIndex}"/>
            <c:order val="${seriesIndex}"/>
            ${title}
            ${firstSeries.shapePropertiesMarkup}
            ${firstSeries.chartSpecificMarkup}
            ${firstSeries.categoriesMarkup}
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

function valuesMarkup(seriesIndex: number, chartData: ChartData, sheetName: string): string {
    if (!sheetName) {

        // Number literal
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

    // Number reference
    const columnId = excelColumnId(seriesIndex + 1);
    const formula = `${sheetName}!$${columnId}$2:$${columnId}$${chartData.categoryNames.length + 1}`;
    return `
        <c:val>
            <c:numRef>
                <c:f>${formula}</c:f>
                <c:numCache>
                    <c:formatCode>${formatCodes[chartData.categoryFormatCode]}</c:formatCode>
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

    for (const child of (node.childNodes ?? [])) {
        updateAccentNumber(child, accentNumber);
    }
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
    const sharedStrings = await updateSharedStringsPart(workbookPart, chartData);
    const sheetPart = await updateSheetPart(workbookPart, sheetName, sharedStrings, chartData);
    if (sheetPart) {
        await updateTablePart(sheetPart, chartData);
    }
    await workbookPart.save();

    // Save the Excel file
    const newXlsxBinary = await xlsx.export();
    await xlsxPart.save(newXlsxBinary);
}

async function updateSharedStringsPart(workbookPart: OpenXmlPart, chartData: ChartData): Promise<IMap<number>> {

    // Get the shared strings part
    const sharedStringsPart = await workbookPart.getFirstPartByType(RelType.SharedStrings);
    if (!sharedStringsPart) {
        return {};
    }

    // Get the shared strings part root
    const root = await sharedStringsPart.xmlRoot() as XmlGeneralNode;

    // Remove all existing strings
    root.childNodes = [];

    let count = 0;
    const sharedStrings: IMap<number> = {};

    function addString(str: string) {
        xml.modify.appendChild(root, xml.create.generalNode("si", {
            childNodes: [
                xml.create.generalNode("t", {
                    attributes: {
                        [OmlAttribute.SpacePreserve]: "preserve"
                    },
                    childNodes: [xml.create.textNode(str)]
                })
            ]
        }));
        sharedStrings[str] = count;
        count++;
    }

    // Add strings
    addString(space);
    for (const name of chartData.categoryNames) {
        addString(name);
    }
    for (const name of chartData.seriesNames) {
        addString(name);
    }

    // Update attributes
    root.attributes["count"] = count.toString();
    root.attributes["uniqueCount"] = count.toString();

    return sharedStrings;
}

async function updateSheetPart(workbookPart: OpenXmlPart, sheetName: string, sharedStrings: IMap<number>, chartData: ChartData): Promise<OpenXmlPart> {

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

    // Create first row
    const firstRow = `
        <row r="1" spans="1:${chartData.seriesNames.length + 1}">
            <c r="A1" t="s">
                <v>${sharedStrings[space]}</v>
            </c>
            ${chartData.seriesNames.map((name, index) => `
                <c r="${excelRowAndColumnId(0, index + 1)}" t="s">
                    <v>${sharedStrings[name]}</v>
                </c>
            `).join("\n")}
        </row>
    `;

    // Create other rows
    const categoryDataTypeAttribute = chartData.categoryDataType === "string" ? ` t="s"` : "";
    const categoryStyleId = await addDxfToDxfs(workbookPart, sheetRoot, chartData.categoryFormatCode);
    const categoryStyleIdAttribute = categoryStyleId ? ` s="${categoryStyleId}"` : "";

    const otherRows = chartData.categoryNames.map((name, rowIndex) => `
        <row r="${rowIndex + 2}" spans="1:${chartData.seriesNames.length + 1}">
            <c r="${excelRowAndColumnId(rowIndex + 1, 0)}"${categoryDataTypeAttribute}${categoryStyleIdAttribute}>
                <v>${chartData.categoryDataType === "string" ? sharedStrings[name] : name}</v>
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
    sheetDataNode.childNodes = [parseXmlNode(firstRow)];
    for (const row of otherRows) {
        xml.modify.appendChild(sheetDataNode, parseXmlNode(row));
    }

    return sheetPart;
}

async function updateTablePart(sheetPart: OpenXmlPart, chartData: ChartData) {

    const tablePart = await sheetPart.getFirstPartByType(RelType.Table);
    if (!tablePart) {
        return;
    }

    // Update ref attribute
    const tablePartRoot = await tablePart.xmlRoot() as XmlGeneralNode;
    tablePartRoot.attributes["ref"] = `A1:${excelRowAndColumnId(chartData.categoryNames.length, chartData.seriesNames.length)}`;

    // Find old table columns
    const tableColumnsNode = tablePartRoot.childNodes?.find(child => child.nodeName === "tableColumns");

    // Add new table columns
    const tableColumns = `
        <tableColumns count="${chartData.seriesNames.length + 1}">
            <tableColumn id="1" name=" "/>
            ${chartData.seriesNames.map((name, index) => `
                <tableColumn id="${index + 2}" name="${name}"/>
            `).join("\n")}
        </tableColumns>
    `;
    xml.modify.insertAfter(parseXmlNode(tableColumns), tableColumnsNode);

    // Remove old table columns
    xml.modify.removeChild(tablePartRoot, tableColumnsNode);
}

/**
 * From the OOXML standard:
 * DXF are differential formatting records which define formatting for all non-cell
 * formatting in a workbook.The dxf formatting is to be applied on
 * top of or in addition to any formatting already present on the object using the dxf record
 */
async function addDxfToDxfs(workbookPart: OpenXmlPart, sheetRoot: XmlNode, formatCodeToAdd: FormatCode): Promise<number> {

    // https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/ChartUpdater.cs#L507

    if (formatCodeToAdd == 0) {
        return 0;
    }

    const stylesPart = await workbookPart.getFirstPartByType(RelType.Styles);
    const stylesRoot = await stylesPart.xmlRoot();

    // Find or create cellXfs
    let cellXfs = stylesRoot.childNodes?.find(child => child.nodeName === "cellXfs") as XmlGeneralNode;
    if (!cellXfs) {
        const cellStyleXfs = stylesRoot.childNodes?.find(child => child.nodeName === "cellStyleXfs");
        const borders = stylesRoot.childNodes?.find(child => child.nodeName === "borders");
        if (!cellStyleXfs && !borders) {
            throw new Error("Internal error. CellXfs, CellStyleXfs and Borders not found.");
        }

        const stylesCellXfs = xml.create.generalNode("cellXfs", {
            attributes: { count: "0" }
        });
        xml.modify.insertAfter(stylesCellXfs, cellStyleXfs ?? borders);

        // Use the cellXfs node from the sheet part
        cellXfs = sheetRoot.childNodes?.find(child => child.nodeName === "cellXfs") as XmlGeneralNode;
    }

    // Add xf to cellXfs
    const count = parseInt(cellXfs.attributes["count"]);
    cellXfs.attributes["count"] = (count + 1).toString();
    xml.modify.appendChild(cellXfs, parseXmlNode(`
        <xf numFmtId="${formatCodeToAdd}" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/>
    `));

    return count;
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

function parseXmlNode(xmlString: string): XmlNode {
    const xmlNode = xml.parser.parse(xmlString);
    xml.modify.removeEmptyTextNodes(xmlNode);
    return xmlNode;
}
