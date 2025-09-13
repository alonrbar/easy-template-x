import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";

describe('link fixture', () => {

    it("inserts hyper link", async () => {

        const template = readFixture("link.docx");

        const data = {
            link: {
                _type: 'link',
                text: "It's easy...",
                target: 'https://github.com/alonrbar/easy-template-x',
                tooltip: 'Click to open link'
            }
        };

        const handler = new TemplateHandler();
        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('link - output.docx', doc);
    });
});
