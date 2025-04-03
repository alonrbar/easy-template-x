import { TemplateHandler } from 'src/templateHandler';
import * as fs from 'fs';

describe.skip('ad-hoc tests', () => {

    test("manual test", async () => {

        const handler = new TemplateHandler();

        const fileName = "test_template";
        const template = fs.readFileSync(`/temp/${fileName}.docx`);

        const data = {};

        const doc = await handler.process(template, data);

        fs.writeFileSync(`/temp/client error/${fileName} - output.docx`, doc);
    });
});