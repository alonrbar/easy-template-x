import { TemplateHandler } from 'src/templateHandler';
import { readFixture } from './fixtureUtils';

describe('custom xml fixtures', () => {

    it("retrieves the custom xml from an office document", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("custom xml.docx");

        const customXmlFiles = await handler.getCustomXml(template);

        expect(customXmlFiles.get("customXml/item1.xml").nodeType).toBe("General");
    });
});