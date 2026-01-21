import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";

describe('raw xml fixture', () => {

    it("4 inserts raw xml content into text node", async () => {

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

    it("3 replaces a paragraph with raw xml content", async () => {

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

    it("2 supports array as input", async () => {

        const template = readFixture("simple.docx");

        const data = {
            simple_prop: {
                _type: 'rawXml',
                xml: [
                    '<w:sym w:font="Wingdings" w:char="F04A"/>'
                ]
            }
        };

        const handler = new TemplateHandler();
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();
    });

    it("1 replaces multiple paragraphs", async () => {

        const template = readFixture("simple.docx");

        const data = {
            simple_prop: {
                _type: 'rawXml',
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
    });

    it("5 works inside a loop", async () => {
        
        const template = readFixture("loop - simple.docx");

        const data = {
            loop_prop: [
                {
                    simple_prop: {
                        _type: 'rawXml',
                        xml: ['<w:p><w:r><w:t>Repl 1</w:t></w:r></w:p>'],
                        replaceParagraph: true
                    }
                },
                {
                    simple_prop: {
                        _type: 'rawXml',
                        xml: ['<w:p><w:r><w:t>Repl 2</w:t></w:r></w:p>'],
                        replaceParagraph: true
                    }
                }
            ]
        };

        const handler = new TemplateHandler();
        
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();
    });
});
