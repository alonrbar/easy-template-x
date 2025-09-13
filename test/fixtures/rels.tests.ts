import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { Zip } from 'src/zip';
import { readFixture } from "./fixtureUtils";

describe('rels fixture', () => {

    it("does not throw on a template with prefixed rels target paths", async () => {

        // Note: The test file for this test case is from Microsoft's online template library and originates from:
        // https://create.microsoft.com/en-us/template/invoice-(document)-f1603197-d3d8-44fc-95f7-0445aa29d9af

        const template = readFixture("rels variations.docx");

        const data = {};

        const handler = new TemplateHandler();
        await handler.process(template, data);
    });

    it("writes part-level rels with relative targets (no word/ prefix)", async () => {

        const template = readFixture("rels variations.docx");

        const handler = new TemplateHandler();
        const out = await handler.process(template, {});

        const zip = await Zip.load(out);
        const relsObj = zip.getFile('word/_rels/document.xml.rels');
        expect(relsObj).toBeTruthy();

        const relsXml = await relsObj.getContentText();
        expect(relsXml).toBeTruthy();

        // Ensure we don't write part-level relationships with Target="word/..."
        expect(relsXml).not.toMatch('Target="word/');

        // Sanity: styles relationship should be present and relative
        expect(relsXml).toMatch('Target="styles.xml"');
    });
});
