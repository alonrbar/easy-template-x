import { TemplateHandler } from 'src/templateHandler';
import { randomParagraphs, randomWords } from '../testUtils';
import { readFixture } from './fixtureUtils';

describe('custom xml fixtures', () => {

    it("handles a file with custom xml", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("custom xml.docx");

        const customXmlFiles = await handler.getCustomXml(template);

        expect(customXmlFiles.size).toBe(1);
    });
});