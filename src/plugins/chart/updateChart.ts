import { OmlAttribute, OpenXmlPart, RelType, Xlsx } from "src/office";
import { IMap } from "src/types";
import { xml, XmlGeneralNode, XmlNode } from "src/xml";
import { Categories, ChartData, chartTypes, formatCode, formatCodes, isStringCategories } from "./chartData";

// Based on: https://github.com/OpenXmlDev/Open-Xml-PowerTools/blob/vNext/OpenXmlPowerTools/ChartUpdater.cs

const space = " ";

export async function updateChart(chartPart: OpenXmlPart, chartData: ChartData) {

    // Input validation
    for (const ser of chartData.series) {
        if (ser.values.length != chartData.categories.names.length) {
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

    const firstSeries = chartNode.childNodes?.find(child => child.nodeName === "c:ser");

    const sheetName = getSheetName(firstSeries);
    const shapeProperties = firstSeries?.childNodes?.find(child => child.nodeName === "c:spPr");
    const chartExtensibility = firstSeries?.childNodes?.find(child => child.nodeName === "c:extLst");

    return {
        sheetName,
        shapePropertiesMarkup: xml.parser.serializeNode(shapeProperties),
        chartSpecificMarkup: chartSpecificMarkup(firstSeries),
        categoriesMarkup: categoriesMarkup(chartData, sheetName),
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

function categoriesMarkup(chartData: ChartData, sheetName: string): string {

    const ptNodes = `
        <c:ptCount val="${chartData.categories.names.length}"/>
        ${chartData.categories.names.map((name, index) => `
            <c:pt idx="${index}">
                <c:v>${name}</c:v>
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
    return `
        <c:cat>
            <c:numRef>
                <c:f>${formula}</c:f>
                <c:numCache>
                    <c:formatCode>${formatCodes[chartData.categories.formatCode]}</c:formatCode>
                    ${ptNodes}
                </c:numCache>
            </c:numRef>
        </c:cat>
    `;
}

function chartSpecificMarkup(firstSeries: XmlNode): string {
    if (!firstSeries) {
        return null;
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

function updateInlineSeries(chartNode: XmlNode, firstSeries: FirstSeriesData, chartData: ChartData) {

    // Remove all old series
    xml.modify.removeChildren(chartNode, child => child.nodeName === "c:ser");

    // Create new series
    const newSeries = chartData.series.map((s, index) => createSeries(s.name, index, firstSeries, chartData));
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

    const color = selectSeriesColor(seriesIndex, chartData);
    setColor(series, color);

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
                    <c:formatCode>${formatCodes[formatCode(chartData.categories)]}</c:formatCode>
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

function selectSeriesColor(seriesIndex: number, chartData: ChartData): string | number {

    // User-defined color
    const color = chartData.series[seriesIndex].color?.trim();
    if (color) {
        const hex = color.startsWith("#") ? color.slice(1) : color;
        return hex.toUpperCase();
    }

    // Auto-selected accent color
    const seriesWithoutColor = chartData.series.slice(0, seriesIndex).filter(s => !s.color);
    const accentNumber = (seriesWithoutColor.length % 6) + 1;
    return accentNumber;
}

function setColor(node: XmlNode, color: string | number) {
    if (!node) {
        return;
    }

    // Was accent color (auto-selected color)
    if (node.nodeName == "a:schemeClr" && node.attributes?.["val"] == "accent1") {

        if (typeof color === "number") {
            node.attributes["val"] = `accent${color}`;
        } else if (typeof color === "string") {
            node.nodeName = "a:srgbClr";
            node.attributes["val"] = color;
        }
        return;
    }

    // Was srgb color (user-defined color)
    if (node.nodeName == "a:srgbClr") {
        if (typeof color === "string") {
            node.attributes["val"] = color;
        }
        return;
    }

    for (const child of (node.childNodes ?? [])) {
        setColor(child, color);
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
    if (isStringCategories(chartData.categories)) {
        for (const name of chartData.categories.names) {
            addString(name);
        }
    }
    for (const name of chartData.series.map(s => s.name)) {
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

    const otherRows = chartData.categories.names.map((name, rowIndex) => `
        <row r="${rowIndex + 2}" spans="1:${chartData.series.length + 1}">
            <c r="${excelRowAndColumnId(rowIndex + 1, 0)}"${categoryDataTypeAttribute}${categoryStyleIdAttribute}>
                <v>${isStringCategories(chartData.categories) ? sharedStrings[name as string] : name}</v>
            </c>
            ${chartData.series.map((s, columnIndex) => `
                <c r="${excelRowAndColumnId(rowIndex + 1, columnIndex + 1)}">
                    <v>${s.values[rowIndex]}</v>
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
    tablePartRoot.attributes["ref"] = `A1:${excelRowAndColumnId(chartData.categories.names.length, chartData.series.length)}`;

    // Find old table columns
    const tableColumnsNode = tablePartRoot.childNodes?.find(child => child.nodeName === "tableColumns");

    // Add new table columns
    const tableColumns = `
        <tableColumns count="${chartData.series.length + 1}">
            <tableColumn id="1" name=" "/>
            ${chartData.series.map((s, index) => `
                <tableColumn id="${index + 2}" name="${s.name}"/>
            `).join("\n")}
        </tableColumns>
    `;
    xml.modify.insertAfter(parseXmlNode(tableColumns), tableColumnsNode);

    // Remove old table columns
    xml.modify.removeChild(tablePartRoot, tableColumnsNode);
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
        <xf numFmtId="${categories.formatCode}" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/>
    `));

    return `s="${count}"`;
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
