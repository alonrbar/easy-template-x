
export type ChartData = StandardChartData | ScatterChartData | BubbleChartData;

export interface StandardChartData {
    categories: Categories;
    series: Series[];
}

export interface ScatterChartData {
    series: ScatterSeries[];
}

export interface BubbleChartData {
    series: BubbleSeries[];
}

export type Categories = NumericCategories | StringCategories | DateCategories;

export interface NumericCategories {
    formatCode: FormatCode;
    names: number[];
}

export interface StringCategories {
    names: string[];
}

export interface DateCategories {
    formatCode: FormatCode;
    names: Date[];
}

export interface Series {
    name: string; // TODO: Make name optional
    /**
     * Color of the series, in hex format (e.g. "#FF0000" for red).
     * If not specified, the color will be auto-selected by the system.
     */
    color?: string;
    values: number[];
}

export interface ScatterSeries {
    name: string; // TODO: Make name optional
    /**
     * Color of the series, in hex format (e.g. "#FF0000" for red).
     * If not specified, the color will be auto-selected by the system.
     */
    color?: string;
    values: ScatterValue[];
}

export interface ScatterValue {
    x: number;
    y: number;
}

export interface BubbleSeries {
    name: string; // TODO: Make name optional
    /**
     * Color of the series, in hex format (e.g. "#FF0000" for red).
     * If not specified, the color will be auto-selected by the system.
     */
    color?: string;
    values: BubbleValue[];
}

export interface BubbleValue extends ScatterValue {
    size: number;
}

export const chartTypes = Object.freeze({
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
    scatterChart: "c:scatterChart",
    bubbleChart: "c:bubbleChart",
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

//
// Functions
//

export function isStandardChartData(chartData: ChartData): chartData is StandardChartData {
    return "categories" in chartData;
}

export function isScatterChartData(chartData: ChartData): chartData is ScatterChartData {
    // Simple, but until we have additional ChartData types, it's enough
    return !isStandardChartData(chartData) && "series" in chartData;
}

export function isBubbleChartData(chartData: ChartData): chartData is BubbleChartData {
    if (!isScatterChartData(chartData)) {
        return false;
    }
    return chartData.series.some(ser => ser.values.some(val => "size" in val));
}

export function isStringCategories(categories: Categories): categories is StringCategories {
    const first = categories.names[0];
    if (typeof first === "string") {
        return true;
    }
    if (typeof first === "number") {
        return false;
    }
    if (first instanceof Date) {
        return false;
    }
    throw new Error(`Invalid categories data type. First category name: ${first}`);
}

export function formatCode(categories: Categories): FormatCode {
    if (isStringCategories(categories)) {
        return 0;
    }
    return categories.formatCode;
}

export function scatterXValues(series: ScatterSeries[]): number[] {
    const uniqueXValues = new Set<number>();
    for (const ser of series) {
        for (const val of ser.values) {
            uniqueXValues.add(val.x);
        }
    }
    return Array.from(uniqueXValues).sort((a, b) => a - b);
}

export function scatterYValues(xValues: number[], series: ScatterSeries): number[] {
    const yValuesMap: Record<number, number> = {};
    for (const val of series.values) {
        yValuesMap[val.x] = val.y;
    }
    return xValues.map(x => yValuesMap[x]);
}

export function bubbleSizeValues(xValues: number[], series: BubbleSeries): number[] {
    const sizeValuesMap: Record<number, number> = {};
    for (const val of series.values) {
        sizeValuesMap[val.x] = val.size;
    }
    return xValues.map(x => sizeValuesMap[x]);
}
