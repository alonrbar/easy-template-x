import { MimeType } from 'src/mimeType';
import { ImageContent } from 'src/plugins/imagePlugin';
import { TemplateHandler } from 'src/templateHandler';
import { readResource } from '../testUtils';
import { readFixture } from './fixtureUtils';

describe('image fixtures', () => {

    it("replaces a single image tag", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("simple.docx");
        const imageFile = readResource("panda1.jpg");

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

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile(doc, 'image - output.docx');
    });

    it("adds two different images", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("loop - simple.docx");
        const imageFile1 = readResource("panda1.jpg");
        const imageFile2 = readResource("panda2.png");

        const imageData1: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile1,
            height: 325,
            width: 600
        };
        const imageData2: ImageContent = {
            _type: 'image',
            format: MimeType.Png,
            source: imageFile2,
            height: 300,
            width: 300
        };
        const data: any = {
            loop_prop: [
                { simple_prop: imageData1 },
                { simple_prop: imageData2 }
            ]            
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile(doc, 'image - output.docx');
    });
});