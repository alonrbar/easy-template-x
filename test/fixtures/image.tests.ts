import { MimeType } from 'src/mimeType';
import { ImageContent } from 'src/plugins/imagePlugin';
import { TemplateHandler } from 'src/templateHandler';
import { readResource, writeTempFile } from '../testUtils';
import { readFixture } from './fixtureUtils';

describe('image fixtures', () => {

    it("replaces a single image tag", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("simple.docx");
        const imageFile = readResource("panda.jpg");

        const imageData: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile,
            height: 325,
            width: 600
        };
        const data: any = {
            simple_prop: imageData
        };

        const doc = await handler.process(template, data);

        // const docXml = await handler.getXml(doc);
        // expect(docXml).toMatchSnapshot();

        writeTempFile(doc, 'image - output.docx');
    });
});