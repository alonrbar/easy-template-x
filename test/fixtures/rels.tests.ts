import { TemplateHandler } from 'src/templateHandler';
import { readFixture } from './fixtureUtils';

describe('rels fixture', () => {

    it("does not throw on a template with prefixed rels target paths", async () => {

        const template = readFixture("rels variations.docx");

        const data = {};

        const handler = new TemplateHandler();
        await handler.process(template, data);
    });
});
