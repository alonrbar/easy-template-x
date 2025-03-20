import { RelType, Xlsx } from "src/office";
import { ChartContent } from "src/plugins/chart/chartContent";
import { DateTimeFormatValues, NumberingFormatValues } from "src/plugins/chart/chartData";
import { TemplateHandler } from "src/templateHandler";
import { writeTempFile } from "test/testUtils";
import { readFixture } from "./fixtureUtils";

describe("chart fixtures", () => {

    describe("line chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot("chart - line - no data", doc);
        });

        test("data matches placeholder (categories and series count)", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - data matches placeholder", doc);
        });

        test("more data than the placeholder", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4", "Q5"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450, 300] },
                    { name: "Truck", values: [200, 300, 350, 411, 500] },
                    { name: "Van", values: [80, 120, 140, 600, 100] },
                    { name: "Bike", values: [10, 20, 30, 40, 50] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - more data", doc);
        });

        test("less data than the placeholder", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220] },
                    { name: "Truck", values: [200, 300, 350] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - less data", doc);
        });

        test("empty placeholder", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line - empty.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - empty", doc);
        });

        test("update title", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: {
                    _type: "chart",
                    title: "My Amazing Chart"
                }
            });

            await verifySnapshot("chart - line - title", doc);
        });

        test("numeric categories - without format code", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: [1, 2, 3, 4]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - numeric categories", doc);
        });

        test("numeric categories - with format code", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    formatCode: NumberingFormatValues.Scientific,
                    names: [1, 2.5, 3.33, 4.2]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - numeric categories with format code", doc);
        });

        test("date categories - without format code", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: [new Date("2020-01-01"), new Date("2020-02-02"), new Date("2020-03-03"), new Date("2020-04-04")]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - date categories", doc);
        });

        test("date categories - with format code", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    formatCode: DateTimeFormatValues.Date_MonthYear,
                    names: [new Date("2020-01-11"), new Date("2020-02-12"), new Date("2020-03-13"), new Date("2020-04-14")]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {
                MyChart: chartData
            });

            await verifySnapshot("chart - line - date categories with format code", doc);
        });
    });

    describe("bar chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - bar.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot("chart - bar - no data", doc);
        });

        test("data matches placeholder (categories and series count)", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - bar.docx");
            const doc = await handler.process(template, {
                chart1: chartData,
                chart2: chartData,
            });

            await verifySnapshot("chart - bar", doc);
        });
    });

    describe("area chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - area.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot("chart - area - no data", doc);
        });

        test("data matches placeholder (categories and series count)", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                title: "My Area Chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450] },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - area.docx");
            const doc = await handler.process(template, {
                MyChart: chartData,
            });

            await verifySnapshot("chart - area", doc);
        });
    });

    describe("column chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - column.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot("chart - column - no data", doc);
        });

        test("data matches placeholder (categories and series count)", async () => {

            const chartData1: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4"]
                },
                series: [
                    { name: "Car", values: [100, 310, 220, 450], color: "#ebfa46" },
                    { name: "Truck", values: [200, 300, 350, 411] },
                    { name: "Van", values: [80, 120, 140, 600] },
                ],
            };

            const chartData2: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Grass Green", "Sky Blue", "Sunset Orange"]
                },
                series: [
                    {
                        name: "Red",
                        color: "#FF0000",
                        values: [50, 89, 255]
                    },
                    {
                        name: "Green",
                        color: "00FF00",
                        values: [168, 210, 100]
                    },
                    {
                        name: "Blue",
                        color: "#0000FF",
                        values: [82, 235, 70]
                    },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - column.docx");
            const doc = await handler.process(template, {
                chart1: chartData1,
                chart2: chartData2,
            });

            await verifySnapshot("chart - column", doc);
        });
    });

    describe("pie chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - pie.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot("chart - pie - no data", doc);
        });

        test("data matches placeholder (categories and series count)", async () => {

            const chartData: ChartContent = {
                _type: "chart",
                categories: {
                    names: ["Q1", "Q2", "Q3", "Q4"]
                },
                series: [
                    { name: "Expenses", values: [100, 310, 220, 450] },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - pie.docx");
            const doc = await handler.process(template, {
                MyChart: chartData,
            });

            await verifySnapshot("chart - pie", doc);
        });
    });

    describe("scatter chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - scatter.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot("chart - scatter - no data", doc);
        });

        test("data matches placeholder (categories and series count)", async () => {

            const scatterChartData: ChartContent = {
                _type: "chart",
                series: [
                    {
                        name: "Expenses",
                        values: [
                            { x: 1, y: 310 },
                            { x: 3, y: 450 },
                            { x: 4, y: 200 },
                            { x: 6, y: 200 },
                        ],
                    },
                    {
                        name: "Sales",
                        color: "#9b32a8",
                        values: [
                            { x: 1, y: 410 },
                            { x: 2, y: 450 },
                            { x: 3, y: 200 },
                            { x: 5, y: 350 },
                        ],
                    },
                ],
            };

            const bubbleChartData: ChartContent = {
                _type: "chart",
                series: [
                    {
                        name: "Sales",
                        values: [
                            { x: 1, y: 10, size: 10 },
                            { x: 2, y: 10, size: 20 },
                            { x: 3, y: 8, size: 40 },
                            { x: 4, y: 8, size: 30 },
                        ],
                    },
                    {
                        name: "Expenses",
                        values: [
                            { x: 1, y: 4, size: 40 },
                            { x: 2, y: 4, size: 20 },
                            { x: 3, y: 3, size: 30 },
                        ],
                    },
                ],
            };

            const handler = new TemplateHandler();

            const template = readFixture("chart - scatter.docx");
            const doc = await handler.process(template, {
                chart1: scatterChartData,
                chart2: bubbleChartData,
            });

            await verifySnapshot("chart - scatter", doc);
        });
    });
});

async function verifySnapshot(testCaseName: string, doc: Buffer) {

    // eslint-disable-next-line no-constant-condition
    if (false) {
        writeTempFile(`${testCaseName} - output.docx`, doc);
        return;
    }

    const handler = new TemplateHandler();

    // Check the charts
    const parts = await handler.getParts(doc, RelType.Chart);
    for (const chartPart of parts) {

        // Check the chart markup
        const chartXml = await chartPart.xmlRoot();
        expect(chartXml).toMatchSnapshot();

        // Open the embedded Excel file
        const xlsxPart = await chartPart.getFirstPartByType(RelType.Package);
        const xlsxBinary = await xlsxPart.getContentBinary();
        const xlsx = await Xlsx.load(xlsxBinary);

        // Check the Excel shared strings file
        const sharedStringsPart = await xlsx.mainDocument.getFirstPartByType(RelType.SharedStrings);
        const sharedStringsXml = await sharedStringsPart.xmlRoot();
        expect(sharedStringsXml).toMatchSnapshot();

        // Check the Excel styles part
        const stylesPart = await xlsx.mainDocument.getFirstPartByType(RelType.Styles);
        const stylesXml = await stylesPart.xmlRoot();
        expect(stylesXml).toMatchSnapshot();

        // Check the Excel sheet
        const sheetPart = await xlsx.mainDocument.getFirstPartByType(RelType.Worksheet);
        const sheetXml = await sheetPart.xmlRoot();
        expect(sheetXml).toMatchSnapshot();

        // Check the Excel table
        const tablePart = await sheetPart.getFirstPartByType(RelType.Table);
        const tableXml = await tablePart.xmlRoot();
        expect(tableXml).toMatchSnapshot();
    }
}
