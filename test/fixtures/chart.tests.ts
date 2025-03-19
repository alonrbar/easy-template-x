import { RelType, Xlsx } from "src/office";
import { TemplateHandler } from "src/templateHandler";
import { readFixture } from "./fixtureUtils";

describe("chart fixtures", () => {

    test("simple line chart", async () => {

        const chartData = {
            seriesNames: ["Car", "Truck", "Van"],
            categoryDataType: "string",
            categoryFormatCode: 0,
            categoryNames: ["Q1", "Q2", "Q3", "Q4"],
            values: [
                [100, 310, 220, 450],
                [200, 300, 350, 411],
                [80, 120, 140, 600],
            ]
        };

        const handler = new TemplateHandler();

        const template = readFixture("chart - line.docx");
        const doc = await handler.process(template, {
            MyChart: {
                _type: "chart",
                ...chartData
            }
        });

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

            // Check the Excel sheet
            const sheetPart = await xlsx.mainDocument.getFirstPartByType(RelType.Worksheet);
            const sheetXml = await sheetPart.xmlRoot();
            expect(sheetXml).toMatchSnapshot();

            // Check the Excel table
            const tablePart = await sheetPart.getFirstPartByType(RelType.Table);
            const tableXml = await tablePart.xmlRoot();
            expect(tableXml).toMatchSnapshot();
        }

        // writeTempFile('chart - line - output.docx', doc);
    });

});
