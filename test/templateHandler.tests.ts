import { expect } from 'chai';
import * as fs from 'fs';
import { TemplateHandler } from '../src/templateHandler';

// tslint:disable:no-unused-expression

describe(nameof(TemplateHandler), () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });

    it("should replace all the tags", async () => {

        const template: Buffer = fs.readFileSync("./test/res/simple template.docx");

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