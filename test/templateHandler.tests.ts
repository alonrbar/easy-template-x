import { expect } from 'chai';
import * as fs from 'fs';
import { TemplateHandler } from '../src/templateHandler';

// tslint:disable:no-unused-expression

describe(nameof(TemplateHandler), () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });

    it("replaces a single tag", async () => {

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

        const docText = await handler.getText(doc);
        expect(docText.trim()).to.be.equal("hello world");
    });

    it("replaces loops correctly", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = fs.readFileSync("./test/res/loop template.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{#loop_prop}{simple_prop}!{/loop_prop}");

        const data = {
            loop_prop: [
                { simple_prop: 'first' },
                { simple_prop: 'second' }
            ]
        };

        const begin = Date.now();
        const doc = await handler.process(template, data);
        const end = Date.now();
        console.log(`took ${end - begin}ms`);

        const docText = await handler.getText(doc);
        expect(docText).to.be.equal("first!second!");
    });

    it("replaces nested loops correctly", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = fs.readFileSync("./test/res/nested loop template.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{#loop_prop1}hi!{#loop_prop2}{simple_prop}!{/loop_prop2}{/loop_prop1}");

        const data = {
            loop_prop1: [
                {
                    loop_prop2: [
                        { simple_prop: 'first' },
                        { simple_prop: 'second' }
                    ]
                },
                {
                    loop_prop2: [
                        { simple_prop: 'third' },
                        { simple_prop: 'forth' }
                    ]
                }
            ]
        };

        const begin = Date.now();
        const doc = await handler.process(template, data);
        const end = Date.now();
        console.log(`took ${end - begin}ms`);

        const docText = await handler.getText(doc);
        expect(docText).to.be.equal("hi!first!second!hi!third!forth!");
    });
});