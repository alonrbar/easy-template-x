import { TemplateHandler } from 'src/templateHandler';
import { readFixture, writeTempFile } from './utils';
import { ImageContent } from 'src/plugins/imagePlugin';
import { MimeType } from 'src/mimeType';

describe('image fixtures', () => {

    it.skip("replaces a single image tag", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("simple.docx");
        const imageFile = readFixture("panda.jpeg");

        const imageData: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile
        };
        const data: any = {
            simple_prop: imageData
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        writeTempFile(doc, 'image - output.docx');
    });
});