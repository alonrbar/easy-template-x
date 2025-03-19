import { RelType, Xlsx } from "src/office";
import { ChartContent } from "src/plugins/chart/chartContent";
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
});

async function verifySnapshot(testCaseName: string, doc: Buffer) {

    // eslint-disable-next-line no-constant-condition
    if (true) {
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
