import { TemplateSyntaxError } from "src/errors";
import { OmlAttribute, OpenXmlPart, RelType, Xlsx } from "src/office";
import { IMap } from "src/types";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { ChartColors } from "./chartColors";
import {
    bubbleSizeValues,
    Categories,
    ChartData,
    ChartType,
    chartTypes,
    formatCode,
    formatIds,
    isBubbleChartData,
    isScatterChartData,
    isStandardChartData,
    isStringCategories,
    ScatterChartData,
    scatterXValues,
    scatterYValues,
    StandardChartData
} from "./chartData";
import { validateChartData } from "./chartDataValidation";

// Based on: https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/ChartUpdater.cs

const space = " ";
const xValuesTitle = "X-Values";

export async function updateChart(chartPart: OpenXmlPart, chartData: ChartData) {

    // Normalize the chart data:
    // Shallow clone and make sure series names are set.
    chartData = Object.assign({}, chartData);
    for (let i = 0; i < chartData.series.length; i++) {
        const ser = chartData.series[i];
        chartData.series[i] = Object.assign({}, ser);
        chartData.series[i].name = seriesName(ser.name, i);
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
        throw new TemplateSyntaxError(`Unsupported chart type. Plot area children: ${plotAreaChildren?.join(", ")}. Supported chart types: ${supportedChartTypes}`);
    }

    const chartType = chartNode.nodeName as ChartType;

    // Input validation
    validateChartData(chartType, chartData);

    // Assemble the existing chart information
    const existingSeries = readExistingSeries(chartNode, chartData);
    const sheetName = existingSeries.map(ser => ser.sheetName).filter(Boolean)?.[0];
    const colors = await ChartColors.load(chartPart);
    const existingChart: ExistingChart = {
        chartPart,
        chartNode,
        chartType,
        sheetName,
        colors,
        series: existingSeries,
    };

    // Update embedded worksheet
    await updateEmbeddedExcelFile(existingChart, chartData);

    // Update inline series
    updateInlineSeries(existingChart, chartData);
}

//
// Read the first series
//

interface ExistingChart {
    chartPart: OpenXmlPart;
    chartNode: XmlNode;
    chartType: ChartType;
    sheetName: string;
    colors: ChartColors;
    series: ExistingSeries[];
}

interface ExistingSeries {
    sheetName: string;
    shapePropertiesMarkup: string;
    chartSpecificMarkup: string;
    categoriesMarkup: string;
    chartExtensibilityMarkup: string;
}

function readExistingSeries(chartNode: XmlNode, chartData: ChartData): ExistingSeries[] {
    const series = chartNode.childNodes?.filter(child => child.nodeName === "c:ser");
    return series.map(ser => readSingleSeries(ser, chartData));
}

function readSingleSeries(seriesNode: XmlNode, chartData: ChartData): ExistingSeries {

    const sheetName = getSheetName(seriesNode);
    const shapeProperties = seriesNode?.childNodes?.find(child => child.nodeName === "c:spPr");
    const chartExtensibility = seriesNode?.childNodes?.find(child => child.nodeName === "c:extLst");

    const formatCode = seriesNode?.
        childNodes?.find(child => child.nodeName === "c:cat")?.
        childNodes?.find(child => child.nodeName === "c:numRef")?.
        childNodes?.find(child => child.nodeName === "c:numCache")?.
        childNodes?.find(child => child.nodeName === "c:formatCode")?.
        childNodes?.find(child => xml.query.isTextNode(child))?.
        textContent;

    return {
        sheetName,
        shapePropertiesMarkup: xml.parser.serializeNode(shapeProperties),
        chartSpecificMarkup: chartSpecificMarkup(seriesNode),
        categoriesMarkup: categoriesMarkup(chartData, sheetName, formatCode),
        chartExtensibilityMarkup: xml.parser.serializeNode(chartExtensibility),
    };
}

function getSheetName(firstSeries: XmlNode): string {
    if (!firstSeries) {
        return null;
    }

    const formulaNode = firstSeries?.
        childNodes?.find(child => child.nodeName === "c:tx")?.
        childNodes?.find(child => child.nodeName === "c:strRef")?.
        childNodes?.find(child => child.nodeName === "c:f");
    const formula = xml.query.lastTextChild(formulaNode, false);
    if (!formula) {
        return null;
    }

    return formula.textContent?.split('!')[0];
}

function categoriesMarkup(chartData: ChartData, sheetName: string, firstSeriesFormatCode: string): string {
    if (isScatterChartData(chartData)) {
        return scatterXValuesMarkup(chartData, sheetName);
    }

    return standardCategoriesMarkup(chartData, sheetName, firstSeriesFormatCode);
}

function standardCategoriesMarkup(chartData: StandardChartData, sheetName: string, firstSeriesFormatCode: string): string {

    function getCategoryName(name: unknown): any {
        if (name instanceof Date) {
            return excelDateValue(name);
        }
        return name;
    }

    const ptNodes = `
        <c:ptCount val="${chartData.categories.names.length}"/>
        ${chartData.categories.names.map((name, index) => `
            <c:pt idx="${index}">
                <c:v>${getCategoryName(name)}</c:v>
            </c:pt>
        `).join("\n")}
    `;

    if (!sheetName) {

        // String literal
        if (isStringCategories(chartData.categories)) {
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

    const formula = `${sheetName}!$A$2:$A$${chartData.categories.names.length + 1}`;

    // String reference
    if (isStringCategories(chartData.categories)) {
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
    const formatCodeValue = chartData.categories.formatCode ?
        formatCode(chartData.categories) :
        firstSeriesFormatCode ?? formatCode(chartData.categories);

    return `
        <c:cat>
            <c:numRef>
                <c:f>${formula}</c:f>
                <c:numCache>
                    <c:formatCode>${formatCodeValue}</c:formatCode>
                    ${ptNodes}
                </c:numCache>
            </c:numRef>
        </c:cat>
    `;
}

function scatterXValuesMarkup(chartData: ScatterChartData, sheetName: string): string {

    const xValues = scatterXValues(chartData.series);

    const ptNodes = `
        <c:ptCount val="${xValues.length}"/>
        ${xValues.map((x, index) => `
            <c:pt idx="${index}">
                <c:v>${x}</c:v>
            </c:pt>
        `).join("\n")}
    `;

    // Number literal
    if (!sheetName) {
        return `
            <c:xVal>
                <c:numLit>
                    ${ptNodes}
                </c:numLit>
            </c:xVal>
        `;
    }

    const formula = `${sheetName}!$A$2:$A$${xValues.length + 1}`;

    // Number reference
    return `
        <c:xVal>
            <c:numRef>
                <c:f>${formula}</c:f>
                <c:numCache>
                    <c:formatCode>General</c:formatCode>
                    ${ptNodes}
                </c:numCache>
            </c:numRef>
        </c:xVal>
    `;
}

function chartSpecificMarkup(firstSeries: XmlNode): string {
    if (!firstSeries) {
        return "";
    }

    const pictureOptions = firstSeries.childNodes?.find(child => child.nodeName === "c:pictureOptions");
    const dLbls = firstSeries.childNodes?.find(child => child.nodeName === "c:dLbls");
    const trendline = firstSeries.childNodes?.find(child => child.nodeName === "c:trendline");
    const errBars = firstSeries.childNodes?.find(child => child.nodeName === "c:errBars");
    const invertIfNegative = firstSeries.childNodes?.find(child => child.nodeName === "c:invertIfNegative");
    const marker = firstSeries.childNodes?.find(child => child.nodeName === "c:marker");
    const smooth = firstSeries.childNodes?.find(child => child.nodeName === "c:smooth");
    const explosion = firstSeries.childNodes?.find(child => child.nodeName === "c:explosion");
    const dPt = firstSeries.childNodes?.filter(child => child.nodeName === "c:dPt");
    const firstSliceAngle = firstSeries.childNodes?.find(child => child.nodeName === "c:firstSliceAngle");
    const holeSize = firstSeries.childNodes?.find(child => child.nodeName === "c:holeSize");
    const serTx = firstSeries.childNodes?.find(child => child.nodeName === "c:serTx");

    return `
        ${xml.parser.serializeNode(pictureOptions)}
        ${xml.parser.serializeNode(dLbls)}
        ${xml.parser.serializeNode(trendline)}
        ${xml.parser.serializeNode(errBars)}
        ${xml.parser.serializeNode(invertIfNegative)}
        ${xml.parser.serializeNode(marker)}
        ${xml.parser.serializeNode(smooth)}
        ${xml.parser.serializeNode(explosion)}
        ${dPt.map(dPt => xml.parser.serializeNode(dPt)).join("\n")}
        ${xml.parser.serializeNode(firstSliceAngle)}
        ${xml.parser.serializeNode(holeSize)}
        ${xml.parser.serializeNode(serTx)}
    `;
}

//
// Update inline series
//

function updateInlineSeries(existingChart: ExistingChart, chartData: ChartData) {

    // Remove all old series
    xml.modify.removeChildren(existingChart.chartNode, child => child.nodeName === "c:ser");

    // Create new series
    const newSeries = chartData.series.map((s, index) => createSeries(existingChart, s.name, index, chartData));
    for (const series of newSeries) {
        xml.modify.appendChild(existingChart.chartNode, series);
    }
}

function createSeries(existingChart: ExistingChart, seriesName: string, seriesIndex: number, chartData: ChartData): XmlNode {
    const firstSeries = existingChart.series[0];
    const isNewSeries = !existingChart.series[seriesIndex];
    const existingSeries = existingChart.series[seriesIndex] ?? firstSeries;

    const title = titleMarkup(seriesName, seriesIndex, existingSeries?.sheetName);
    const values = valuesMarkup(seriesIndex, chartData, existingSeries?.sheetName);

    const series = parseXmlNode(`
        <c:ser>
            <c:idx val="${seriesIndex}"/>
            <c:order val="${seriesIndex}"/>
            ${title}
            ${existingSeries?.shapePropertiesMarkup ?? ""}
            ${existingSeries?.chartSpecificMarkup ?? ""}
            ${existingSeries?.categoriesMarkup ?? ""}
            ${values}
            ${existingSeries?.chartExtensibilityMarkup ?? ""}
        </c:ser>
    `);

    const color = selectSeriesColor(seriesIndex, chartData);
    existingChart.colors.setSeriesColor(existingChart.chartType, series, isNewSeries, color);

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

    if (isScatterChartData(chartData)) {
        return scatterValuesMarkup(seriesIndex, chartData, sheetName);
    }

    return standardValuesMarkup(seriesIndex, chartData, sheetName);
}

function standardValuesMarkup(seriesIndex: number, chartData: StandardChartData, sheetName: string): string {
    if (!sheetName) {

        // Number literal
        return `
            <c:val>
                <c:numLit>
                    <c:ptCount val="${chartData.categories.names.length}" />
                    ${chartData.categories.names.map((name, catIndex) => `
                        <c:pt idx="${catIndex}">
                            <c:v>${chartData.series[seriesIndex].values[catIndex]}</c:v>
                        </c:pt>
                    `).join("\n")}
                </c:numLit>
            </c:val>
        `;
    }

    // Number reference
    const columnId = excelColumnId(seriesIndex + 1);
    const formula = `${sheetName}!$${columnId}$2:$${columnId}$${chartData.categories.names.length + 1}`;
    return `
        <c:val>
            <c:numRef>
                <c:f>${formula}</c:f>
                <c:numCache>
                    <c:formatCode>General</c:formatCode>
                    <c:ptCount val="${chartData.categories.names.length}" />
                        ${chartData.categories.names.map((name, catIndex) => `
                            <c:pt idx="${catIndex}">
                                <c:v>${chartData.series[seriesIndex].values[catIndex]}</c:v>
                        </c:pt>
                    `).join("\n")}
                </c:numCache>
            </c:numRef>
        </c:val>
    `;
}

function scatterValuesMarkup(seriesIndex: number, chartData: ScatterChartData, sheetName: string): string {

    const xValues = scatterXValues(chartData.series);
    const yValues = scatterYValues(xValues, chartData.series[seriesIndex]);

    const ptCountNode = `
        <c:ptCount val="${yValues.length}"/>
    `;

    // Y values
    const yValueNodes = yValues.map((y, index) => {
        if (y === null || y === undefined) {
            return "";
        }
        return `
            <c:pt idx="${index}">
                <c:v>${y}</c:v>
            </c:pt>
        `;
    });

    // Bubble size values
    const bubbleSizeNodes = isBubbleChartData(chartData) ? chartData.series[seriesIndex].values.map((v, index) => {
        if (v.size === null || v.size === undefined) {
            return "";
        }
        return `
            <c:pt idx="${index}">
                <c:v>${v.size}</c:v>
            </c:pt>
        `;
    }) : [];

    // Number literal
    if (!sheetName) {

        const yVal = `
            <c:yVal>
                <c:numLit>
                    ${ptCountNode}
                    ${yValueNodes.join("\n")}
                </c:numLit>
            </c:yVal>
        `;

        if (!isBubbleChartData(chartData)) {
            return yVal;
        }

        const bubbleSize = `
            <c:bubbleSize>
                <c:numLit>
                    ${ptCountNode}
                    ${bubbleSizeNodes.join("\n")}
                </c:numLit>
            </c:bubbleSize>
        `;

        return `
            ${yVal}
            ${bubbleSize}
        `;
    }

    // Number reference

    const yValColumnId = excelColumnId(seriesIndex + 1);
    const yValFormula = `${sheetName}!$${yValColumnId}$2:$${yValColumnId}$${yValues.length + 1}`;
    const yVal = `
        <c:yVal>
            <c:numRef>
                <c:f>${yValFormula}</c:f>
                <c:numCache>
                    <c:formatCode>General</c:formatCode>
                    ${ptCountNode}
                    ${yValueNodes.join("\n")}
                </c:numCache>
            </c:numRef>
        </c:yVal>
    `;

    if (!isBubbleChartData(chartData)) {
        return yVal;
    }

    const bubbleSizeColumnId = excelColumnId(seriesIndex + 2);
    const bubbleSizeFormula = `${sheetName}!$${bubbleSizeColumnId}$2:$${bubbleSizeColumnId}$${yValues.length + 1}`;
    const bubbleSize = `
        <c:bubbleSize>
            <c:numRef>
                <c:f>${bubbleSizeFormula}</c:f>
                <c:numCache>
                    <c:formatCode>General</c:formatCode>
                    ${ptCountNode}
                    ${bubbleSizeNodes.join("\n")}
                </c:numCache>
            </c:numRef>
        </c:bubbleSize>
    `;

    return `
        ${yVal}
        ${bubbleSize}
    `;
}

function selectSeriesColor(seriesIndex: number, chartData: ChartData): string | number {

    // Use manual hex color
    const color = chartData.series[seriesIndex].color?.trim();
    if (color) {
        const hex = color.startsWith("#") ? color.slice(1) : color;
        return hex.toUpperCase();
    }

    // Auto-select accent color
    return seriesIndex;
}

//
// Update the embedded Excel workbook file
//

async function updateEmbeddedExcelFile(existingChart: ExistingChart, chartData: ChartData) {

    // Get the relation ID of the embedded Excel file
    const rootNode = await existingChart.chartPart.xmlRoot();
    const externalDataNode = rootNode.childNodes?.find(child => child.nodeName === "c:externalData") as XmlGeneralNode;
    const workbookRelId = externalDataNode?.attributes["r:id"];
    if (!workbookRelId) {
        return;
    }

    // Open the embedded Excel file
    const xlsxPart = await existingChart.chartPart.getPartById(workbookRelId);
    if (!xlsxPart) {
        return;
    }
    const xlsxBinary = await xlsxPart.getContentBinary();
    const xlsx = await Xlsx.load(xlsxBinary);

    // Update the workbook
    const workbookPart = xlsx.mainDocument;
    const sharedStrings = await updateSharedStringsPart(workbookPart, chartData);
    const sheetPart = await updateSheetPart(workbookPart, existingChart.sheetName, sharedStrings, chartData);
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

    // Default strings
    if (isStandardChartData(chartData)) {
        addString(space);
    }
    if (isScatterChartData(chartData)) {
        addString(xValuesTitle);
    }

    // Category strings
    if (isStandardChartData(chartData) && isStringCategories(chartData.categories)) {
        for (const name of chartData.categories.names) {
            addString(name);
        }
    }

    // Series strings
    for (const name of chartData.series.map(s => s.name)) {
        addString(name);

        if (isBubbleChartData(chartData)) {
            addString(name + " Size");
        }
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

    let newRows: XmlNode[] = [];
    if (isStandardChartData(chartData)) {
        newRows = await updateSheetRootStandard(workbookPart, sheetRoot, chartData, sharedStrings);
    } else if (isScatterChartData(chartData)) {
        newRows = await updateSheetRootScatter(workbookPart, sheetRoot, chartData, sharedStrings);
    }

    // Replace sheet data
    const sheetDataNode = sheetRoot.childNodes?.find(child => child.nodeName === "sheetData");
    sheetDataNode.childNodes = [];
    for (const row of newRows) {
        xml.modify.appendChild(sheetDataNode, row);
    }

    return sheetPart;
}

async function updateSheetRootStandard(workbookPart: OpenXmlPart, sheetRoot: XmlNode, chartData: StandardChartData, sharedStrings: IMap<number>): Promise<XmlNode[]> {

    // Create first row
    const firstRow = `
        <row r="1" spans="1:${chartData.series.length + 1}">
            <c r="A1" t="s">
                <v>${sharedStrings[space]}</v>
            </c>
            ${chartData.series.map((s, index) => `
                <c r="${excelRowAndColumnId(0, index + 1)}" t="s">
                    <v>${sharedStrings[s.name]}</v>
                </c>
            `).join("\n")}
        </row>
    `;

    // Create other rows
    const categoryDataTypeAttribute = isStringCategories(chartData.categories) ? ` t="s"` : "";
    const categoryStyleIdAttribute = await updateStylesPart(workbookPart, sheetRoot, chartData.categories);

    function getCategoryName(name: unknown): any {
        if (name instanceof Date) {
            return excelDateValue(name);
        }
        if (typeof name === "string") {
            return sharedStrings[name];
        }
        return name;
    }

    const otherRows = chartData.categories.names.map((name, rowIndex) => `
        <row r="${rowIndex + 2}" spans="1:${chartData.series.length + 1}">
            <c r="${excelRowAndColumnId(rowIndex + 1, 0)}"${categoryDataTypeAttribute}${categoryStyleIdAttribute}>
                <v>${getCategoryName(name)}</v>
            </c>
            ${chartData.series.map((s, columnIndex) => `
                <c r="${excelRowAndColumnId(rowIndex + 1, columnIndex + 1)}">
                    <v>${s.values[rowIndex]}</v>
                </c>
            `).join("\n")}
        </row>
    `);

    return [
        parseXmlNode(firstRow),
        ...otherRows.map(row => parseXmlNode(row))
    ];
}

async function updateSheetRootScatter(workbookPart: OpenXmlPart, sheetRoot: XmlNode, chartData: ScatterChartData, sharedStrings: IMap<number>): Promise<XmlNode[]> {

    const isBubbleChart = isBubbleChartData(chartData);

    // Create first row
    const firstRowColumns = chartData.series.map((s, index) => {
        const baseIndex = isBubbleChart ? index * 2 : index;

        const seriesNameColumn = `
            <c r="${excelRowAndColumnId(0, baseIndex + 1)}" t="s">
                <v>${sharedStrings[s.name]}</v>
            </c>
        `;
        if (!isBubbleChart) {
            return seriesNameColumn;
        }

        const bubbleSizeColumn = `
            <c r="${excelRowAndColumnId(0, baseIndex + 2)}" t="s">
                <v>${sharedStrings[s.name + " Size"]}</v>
            </c>
        `;
        return `
            ${seriesNameColumn}
            ${bubbleSizeColumn}
        `;
    });
    const firstRow = `
        <row r="1" spans="1:${chartData.series.length + 1}">
            <c r="A1" t="s">
                <v>${sharedStrings[xValuesTitle]}</v>
            </c>
            ${firstRowColumns.join("\n")}
        </row>
    `;

    const xValues = scatterXValues(chartData.series);

    // Create other rows
    const yValues = chartData.series.map(s => scatterYValues(xValues, s));
    const bubbleSizes = isBubbleChart ? chartData.series.map(s => bubbleSizeValues(xValues, s)) : [];
    function otherRowColumns(rowIndex: number) {
        return chartData.series.map((s, seriesIndex) => {
            const baseIndex = isBubbleChart ? seriesIndex * 2 : seriesIndex;

            const yValueColumn = `
                <c r="${excelRowAndColumnId(rowIndex + 1, baseIndex + 1)}">
                    <v>${yValues[seriesIndex][rowIndex]}</v>
                </c>
            `;
            if (!isBubbleChart) {
                return yValueColumn;
            }

            const bubbleSizeColumn = `
                <c r="${excelRowAndColumnId(rowIndex + 1, baseIndex + 2)}" t="s">
                    <v>${bubbleSizes[seriesIndex][rowIndex]}</v>
                </c>
            `;
            return `
                ${yValueColumn}
                ${bubbleSizeColumn}
            `;
        });
    }
    const otherRows = xValues.map((x, rowIndex) => `
        <row r="${rowIndex + 2}" spans="1:${chartData.series.length + 1}">
            <c r="${excelRowAndColumnId(rowIndex + 1, 0)}">
                <v>${x}</v>
            </c>
            ${otherRowColumns(rowIndex).join("\n")}
        </row>
    `);

    return [
        parseXmlNode(firstRow),
        ...otherRows.map(row => parseXmlNode(row))
    ];
}

async function updateTablePart(sheetPart: OpenXmlPart, chartData: ChartData) {

    const tablePart = await sheetPart.getFirstPartByType(RelType.Table);
    if (!tablePart) {
        return;
    }

    // Update ref attribute
    const tablePartRoot = await tablePart.xmlRoot() as XmlGeneralNode;
    tablePartRoot.attributes["ref"] = `A1:${excelRowAndColumnId(tableRowsCount(chartData), chartData.series.length)}`;

    // Find old table columns
    const tableColumnsNode = tablePartRoot.childNodes?.find(child => child.nodeName === "tableColumns");

    // Add new table columns
    const firstColumnName = isScatterChartData(chartData) ? xValuesTitle : space;
    const otherColumns = chartData.series.map((s, index) => {
        const baseIndex = isBubbleChartData(chartData) ? index * 2 : index;
        return `
            <tableColumn id="${baseIndex + 2}" name="${s.name}"/>
            ${isBubbleChartData(chartData) ? `
                <tableColumn id="${baseIndex + 3}" name="${s.name} Size"/>
            ` : ""}
        `;
    });
    const tableColumns = `
        <tableColumns count="${chartData.series.length + 1}">
            <tableColumn id="1" name="${firstColumnName}"/>
            ${otherColumns.join("\n")}
        </tableColumns>
    `;
    xml.modify.insertAfter(parseXmlNode(tableColumns), tableColumnsNode);

    // Remove old table columns
    xml.modify.removeChild(tablePartRoot, tableColumnsNode);
}

function tableRowsCount(chartData: ChartData): number {

    if (isScatterChartData(chartData)) {
        return scatterXValues(chartData.series).length;
    }

    return chartData.categories.names.length;
}

async function updateStylesPart(workbookPart: OpenXmlPart, sheetRoot: XmlNode, categories: Categories): Promise<string> {

    // https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/ChartUpdater.cs#L507

    if (isStringCategories(categories)) {
        return "";
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
        <xf numFmtId="${formatIds[formatCode(categories)]}" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/>
    `));

    return `s="${count}"`;
}

//
// Helper functions
//

function seriesName(name: string, index: number): string {
    return name ?? `Series ${index + 1}`;
}

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

function excelDateValue(date: Date): number {
    const millisPerDay = 86400000;
    const excelEpoch = new Date("1899-12-30");
    return (date.getTime() - excelEpoch.getTime()) / millisPerDay;
}

function parseXmlNode(xmlString: string): XmlNode {
    const xmlNode = xml.parser.parse(xmlString);
    xml.modify.removeEmptyTextNodes(xmlNode);
    return xmlNode;
}
