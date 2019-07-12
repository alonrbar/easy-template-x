import { TemplateHandler } from 'src/templateHandler';
import { readFixture } from './utils';

describe('raw xml fixture', () => {

    it("inserts raw xml content", async () => {

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

        // writeTempFile(doc, 'raw xml - output.docx');
    });
});