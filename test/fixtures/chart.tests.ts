import { TemplateHandler } from "src/templateHandler";
import { writeTempFile } from "test/testUtils";
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

        writeTempFile('chart - line - output.docx', doc);
    });

});
