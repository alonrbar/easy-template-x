import { expect } from 'chai';
import * as fs from 'fs';
import { TemplateHandler } from '../src/templateHandler';

// tslint:disable:no-unused-expression

describe(nameof(TemplateHandler), () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });

    it("replaces a single tags", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = fs.readFileSync("./test/res/simple template.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{simple_prop}");
        
        // replace tags

        const data = {
            simple_prop: 'hello world'
        };
        const doc = await handler.process(template, data);

        const docBlob = await doc.generateAsync({ type: 'arraybuffer' });
        const docText = await handler.getText(docBlob);
        expect(docText).to.be.equal("hello world");
    });

    it.skip("replaces loops correctly", async () => {

        const template: Buffer = fs.readFileSync("./test/res/loop template.docx");

        const data = {
            loop_prop: [
                { simple_prop: 'first' },
                { simple_prop: 'second' }
            ]
        };

        const handler = new TemplateHandler();
        const doc = await handler.process(template, data);

        const docText = await doc.toString();
        expect(docText).to.be.equal("first second");
    });
});