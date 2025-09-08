import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";

describe('raw xml fixture', () => {

    it("inserts raw xml content into textNode", async () => {

        const template = readFixture("simple.docx");

        const data = {
            // insert a smiley icon
            simple_prop: {
                _type: 'rawXml',
                xml: '<w:sym w:font="Wingdings" w:char="F04A"/>'
            }
        };

        const handler = new TemplateHandler();
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('raw xml - output.docx', doc);
    });

    it("inserts raw xml content into paragrafNode", async () => {

        const template = readFixture("simple.docx");

        const data = {
            // insert a table
            simple_prop: {
                _type: 'rawXml',
                xml: '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Hello</w:t></w:r></w:p></w:tc></w:tr></w:tbl>',
                replaceParagraph: true
            }
        };

        const handler = new TemplateHandler();
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('raw xml - output.docx', doc);
    });
});
