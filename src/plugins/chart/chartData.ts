
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
    formatCode?: NumberingFormat;
    names: number[];
}

export interface StringCategories {
    names: string[];
}

export interface DateCategories {
    formatCode?: DateTimeFormat;
    names: Date[];
}

export interface Series {
    name?: string;
    /**
     * Color of the series, in hex format (e.g. "#FF0000" for red).
     * If not specified, the color will be auto-selected by the system.
     */
    color?: string;
    values: number[];
}

export interface ScatterSeries {
    name?: string;
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
    name?: string;
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
    doughnutChart: "c:doughnutChart",
    ofPieChart: "c:ofPieChart",
    pie3DChart: "c:pie3DChart",
    pieChart: "c:pieChart",
    scatterChart: "c:scatterChart",
    bubbleChart: "c:bubbleChart",
} as const);

export type ChartType = typeof chartTypes[keyof typeof chartTypes];

export const NumberingFormatValues = Object.freeze({
    General: "General",
    Integer: "0",
    Decimal_2Places: "0.00",
    ThousandsSeparator: "#,##0",
    ThousandsSeparator_2DecimalPlaces: "#,##0.00",
    ThousandsSeparator_ParenthesesForNegatives: "#,##0 ;(#,##0)",
    ThousandsSeparator_RedNegatives: "#,##0 ;[Red](#,##0)",
    ThousandsSeparator_2DecimalPlaces_ParenthesesForNegatives: "#,##0.00;(#,##0.00)",
    ThousandsSeparator_2DecimalPlaces_RedNegatives: "#,##0.00;[Red](#,##0.00)",
    Percentage: "0%",
    Percentage_2DecimalPlaces: "0.00%",
    Scientific: "0.00E+00",
    Scientific_1DecimalPlace: "##0.0E+0",
    Fraction_SingleDigit: "# ?/?",
    Fraction_DoubleDigit: "# ??/?",
    Text: "@",
} as const);

export type NumberingFormat = typeof NumberingFormatValues[keyof typeof NumberingFormatValues];

export const DateTimeFormatValues = Object.freeze({
    General: "General",
    Date_Short: "mm-dd-yy",
    Date_DayMonthYear: "d-mmm-yy",
    Date_DayMonth: "d-mmm",
    Date_MonthYear: "mmm-yy",
    Time_12Hour: "h:mm AM/PM",
    Time_12Hour_WithSeconds: "h:mm:ss AM/PM",
    Time_24Hour: "h:mm",
    Time_24Hour_WithSeconds: "h:mm:ss",
    DateTime_Short: "m/d/yy h:mm",
    Time_MinutesSeconds: "mm:ss",
    Time_ElapsedHoursMinutesSeconds: "[h]:mm:ss",
    Time_CompactMinutesSecondsWithDecimal: "mmss.0",
    Text: "@",
} as const);

export type DateTimeFormat = typeof DateTimeFormatValues[keyof typeof DateTimeFormatValues];

// Section 18.8.30 of the ECMA-376 standard
// https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.spreadsheet.numberingformat
// https://support.microsoft.com/en-us/office/number-format-codes-in-excel-for-mac-5026bbd6-04bc-48cd-bf33-80f18b4eae68
export const formatIds = Object.freeze({
    "General": 0,
    "0": 1,
    "0.00": 2,
    "#,##0": 3,
    "#,##0.00": 4,
    "0%": 9,
    "0.00%": 10,
    "0.00E+00": 11,
    "# ?/?": 12,
    "# ??/?": 13,
    "mm-dd-yy": 14,
    "d-mmm-yy": 15,
    "d-mmm": 16,
    "mmm-yy": 17,
    "h:mm AM/PM": 18,
    "h:mm:ss AM/PM": 19,
    "h:mm": 20,
    "h:mm:ss": 21,
    "m/d/yy h:mm": 22,
    "#,##0 ;(#,##0)": 37,
    "#,##0 ;[Red](#,##0)": 38,
    "#,##0.00;(#,##0.00)": 39,
    "#,##0.00;[Red](#,##0.00)": 40,
    "mm:ss": 45,
    "[h]:mm:ss": 46,
    "mmss.0": 47,
    "##0.0E+0": 48,
    "@": 49
});

export type FormatCode = NumberingFormat | DateTimeFormat;

//
// Functions
//

export function chartFriendlyName(chartType: ChartType): string {
    const name = chartType.replace("c:", "").replace("Chart", "");
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function isStandardChartType(chartType: ChartType): boolean {
    return chartType === chartTypes.area3DChart ||
        chartType === chartTypes.areaChart ||
        chartType === chartTypes.bar3DChart ||
        chartType === chartTypes.barChart ||
        chartType === chartTypes.line3DChart ||
        chartType === chartTypes.lineChart ||
        chartType === chartTypes.doughnutChart ||
        chartType === chartTypes.ofPieChart ||
        chartType === chartTypes.pie3DChart ||
        chartType === chartTypes.pieChart;
}

export function isScatterChartType(chartType: ChartType): boolean {
    return chartType === chartTypes.scatterChart;
}

export function isBubbleChartType(chartType: ChartType): boolean {
    return chartType === chartTypes.bubbleChart;
}

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
    return (typeof first === "string");
}

export function isDateCategories(categories: Categories): categories is DateCategories {
    const first = categories.names[0];
    return (first instanceof Date);
}

export function formatCode(categories: Categories): FormatCode {
    if (isStringCategories(categories)) {
        return "General";
    }
    if (isDateCategories(categories)) {
        return categories.formatCode ?? "mm-dd-yy";
    }

    return categories.formatCode ?? "General";
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
