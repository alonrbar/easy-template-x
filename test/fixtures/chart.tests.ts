import { RelType, Xlsx } from "src/office";
import { ChartContent } from "src/plugins/chart/chartContent";
import { TemplateHandler } from "src/templateHandler";
import { readFixture } from "./fixtureUtils";

describe("chart fixtures", () => {

    describe("line chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - line.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot(doc);

            // writeTempFile('chart - line - no data - output.docx', doc);
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

            await verifySnapshot(doc);

            // writeTempFile('chart - line - output.docx', doc);
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

            await verifySnapshot(doc);

            // writeTempFile('chart - line - more data - output.docx', doc);
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

            await verifySnapshot(doc);

            // writeTempFile('chart - line - less data - output.docx', doc);
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

            await verifySnapshot(doc);

            // writeTempFile('chart - line - empty - output.docx', doc);
        });
    });

    describe("bar chart", () => {

        test("no chart data", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("chart - bar.docx");
            const doc = await handler.process(template, {});

            await verifySnapshot(doc);

            // writeTempFile('chart - bar - output.docx', doc);
        });
    });

});

async function verifySnapshot(doc: Buffer) {

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
