import { TemplateDataError } from "src/errors";
import {
    BubbleChartData,
    ChartData,
    chartFriendlyName,
    ChartType,
    isBubbleChartType,
    isScatterChartType,
    isStandardChartType,
    ScatterChartData,
    StandardChartData
} from "./chartData";

export function validateChartData(chartType: ChartType, chartData: ChartData) {

    if (isStandardChartType(chartType)) {
        validateStandardChartData(chartData as StandardChartData, chartType);
        return;
    }

    if (isScatterChartType(chartType)) {
        validateScatterChartData(chartData as ScatterChartData, chartType);
        return;
    }

    if (isBubbleChartType(chartType)) {
        validateScatterChartData(chartData as BubbleChartData, chartType);
        validateBubbleChartData(chartData as BubbleChartData, chartType);
        return;
    }

    throw new TemplateDataError("Invalid chart data: " + JSON.stringify(chartData));
}

function validateStandardChartData(chartData: StandardChartData, chartType: ChartType) {
    if (!chartData.categories) {
        throw new TemplateDataError(`${chartFriendlyName(chartType)} chart must have categories.`);
    }

    if (!chartData.categories.names) {
        throw new TemplateDataError(`${chartFriendlyName(chartType)} chart categories must have a "names" field.`);
    }

    for (const ser of chartData.series) {

        if (!ser.values) {
            throw new TemplateDataError(`${chartFriendlyName(chartType)} chart series must have a "values" field.`);
        }

        // Check if the series values and category names have the same length (same number of x and y values)
        if (ser.values.length != chartData.categories.names.length) {
            throw new TemplateDataError(`${chartFriendlyName(chartType)} chart series values and category names must have the same length.`);
        }

        // Verify series values are numbers
        for (const val of ser.values) {
            if (val === null || val === undefined) {
                continue;
            }
            if (typeof val === "number") {
                continue;
            }
            throw new TemplateDataError(`${chartFriendlyName(chartType)} chart series values must be numbers.`);
        }
    }
}

function validateScatterChartData(chartData: ScatterChartData, chartType: ChartType) {

    if (!chartData.series) {
        throw new TemplateDataError(`${chartFriendlyName(chartType)} chart must have series.`);
    }

    for (const ser of chartData.series) {

        if (!ser.values) {
            throw new TemplateDataError(`${chartFriendlyName(chartType)} chart series must have a "values" field.`);
        }

        for (const val of ser.values) {

            // Verify series values are valid point objects
            if (typeof val === "object" && "x" in val && "y" in val) {
                continue;
            }
            throw new TemplateDataError(`${chartFriendlyName(chartType)} chart series values must have x and y properties.`);
        }
    }
}

function validateBubbleChartData(chartData: BubbleChartData, chartType: ChartType) {

    for (const ser of chartData.series) {
        for (const val of ser.values) {

            // Verify series points have a "size" property (x and y are checked in validateScatterChartData)
            if (typeof val === "object" && "size" in val) {
                continue;
            }
            throw new TemplateDataError(`${chartFriendlyName(chartType)} chart series values must have a "size" property.`);
        }
    }
}
