import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";
import { writeTempFile } from "test/testUtils";


describe('raw xml multi fixture', () => {

    it("inserts raw xml content into textNode", async () => {

        const template = readFixture("simple.docx");

        const data = {
            // insert a smiley icon (single element check)
            simple_prop: {
                _type: 'rawXmlMultiParagraph',
                xml: ['<w:sym w:font="Wingdings" w:char="F04A"/>']
            }
        };

        const handler = new TemplateHandler();
        
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        //writeTempFile('raw xml multi - output.docx', doc);
    });

    it("inserts raw xml content into paragrafNode", async () => {

        const template = readFixture("simple.docx");

        const data = {
            // insert multiple paragraphs
            simple_prop: {
                _type: 'rawXmlMultiParagraph',
                xml: [
                    '<w:p><w:r><w:t>Paragraph 1</w:t></w:r></w:p>',
                    '<w:p><w:r><w:t>Paragraph 2</w:t></w:r></w:p>'
                ],
                replaceParagraph: true
            }
        };

        const handler = new TemplateHandler();
        
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        //writeTempFile('raw xml multi 2 - output.docx', doc);
    });
});
