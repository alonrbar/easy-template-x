import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";

describe('no tags fixture', () => {

    it("does not throw on a template without tags", async () => {

        const template = readFixture("no tags.docx");

        const data = {};

        const handler = new TemplateHandler();
        await handler.process(template, data);
    });

    it("does not alter a document without tags", async () => {

        const template = readFixture("no tags.docx");

        const data = {};

        const handler = new TemplateHandler();
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('no tags - output.docx', doc);
    });
});
