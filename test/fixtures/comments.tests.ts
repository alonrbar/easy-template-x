import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";

describe('comments', () => {

    it("process correctly a template with comments", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("comments.docx");

        // Verify getText
        const templateText = await handler.getText(template);
        expect(templateText.trim()).toEqual("{simple_prop}");

        const data = {
            simple_prop: "foo"
        };
        const doc = await handler.process(template, data);

        // Verify template processing
        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('comments - out.docx', doc);
    });
});
