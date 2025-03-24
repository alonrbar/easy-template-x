import { TemplateDataError } from "src/errors";
import { validateChartData } from "src/plugins/chart/chartDataValidation";
import { chartTypes } from "src/plugins/chart/chartData";

describe(validateChartData, () => {

    test.each([
        {
            name: "line chart missing categories",
            chartType: chartTypes.lineChart,
            chartData: {
                series: [{ name: "Car", values: [100, 310, 220, 450] }],
            },
            wantError: "Line chart must have categories.",
        },
        {
            name: "line chart missing categories names",
            chartType: chartTypes.lineChart,
            chartData: {
                categories: {},
            },
            wantError: `Line chart categories must have a "names" field.`,
        },
        {
            name: "line chart categories and series values length mismatch",
            chartType: chartTypes.lineChart,
            chartData: {
                categories: { names: ["Q1", "Q2", "Q3", "Q4"] },
                series: [{ name: "Car", values: [1] }],
            },
            wantError: "Line chart series values and category names must have the same length.",
        },
        {
            name: "line chart missing series values",
            chartType: chartTypes.lineChart,
            chartData: {
                categories: { names: ["Q1", "Q2", "Q3", "Q4"] },
                series: [{ name: "Car" }],
            },
            wantError: `Line chart series must have a "values" field.`,
        },
        {
            name: "line chart series values are not numbers",
            chartType: chartTypes.lineChart,
            chartData: {
                categories: { names: ["Q1", "Q2", "Q3", "Q4"] },
                series: [{ name: "Car", values: ["100", "310", "220", "450"] }],
            },
            wantError: "Line chart series values must be numbers.",
        },
        {
            name: "scatter chart missing series values",
            chartType: chartTypes.scatterChart,
            chartData: {
                series: [{ name: "Car" }],
            },
            wantError: `Scatter chart series must have a "values" field.`,
        },
        {
            name: "scatter chart series values are not objects",
            chartType: chartTypes.scatterChart,
            chartData: {
                series: [{ name: "Car", values: [100, 310, 220, 450] }],
            },
            wantError: `Scatter chart series values must have x and y properties.`,
        },
        {
            name: "bubble chart missing series values",
            chartType: chartTypes.bubbleChart,
            chartData: {
                series: [{ name: "Car" }],
            },
            wantError: `Bubble chart series must have a "values" field.`,
        },
        {
            name: "bubble chart series values are not objects",
            chartType: chartTypes.bubbleChart,
            chartData: {
                series: [{ name: "Car", values: [100, 310, 220, 450] }],
            },
            wantError: `Bubble chart series values must have x and y properties.`,
        },
        {
            name: "bubble chart series values do not have size property",
            chartType: chartTypes.bubbleChart,
            chartData: {
                series: [{ name: "Car", values: [{ x: 100, y: 310 }, { x: 220, y: 450 }] }],
            },
            wantError: `Bubble chart series values must have a "size" property.`,
        },
    ])("input validation - $name", async ({ chartType, chartData, wantError }) => {

        let error: Error;
        try {
            validateChartData(chartType, chartData as any);
        } catch (e) {
            error = e as Error;
        }

        if (wantError) {
            expect(error).toBeDefined();
            expect(error).toBeInstanceOf(TemplateDataError);
            expect(error.message).toContain(wantError);
        } else {
            expect(error).toBeUndefined();
        }
    });
});