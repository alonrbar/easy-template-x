import { expect } from 'chai';
import * as fs from 'fs';
import { TemplateHandler } from 'src/templateHandler';

// tslint:disable:no-unused-expression

describe(nameof(TemplateHandler), () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });

    it("replaces a single tag", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = fs.readFileSync("./test/res/simple.docx");
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

    it("replaces newlines with <w:br/>", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = fs.readFileSync("./test/res/simple.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{simple_prop}");

        // replace tags

        const data = {
            simple_prop: 'first line\nsecond line'
        };

        const doc = await handler.process(template, data);

        fs.writeFileSync('/temp/simple - multiline - output.docx', doc);

        const docText = await handler.getText(doc);
        expect(docText.trim()).to.be.equal("first linesecond line");
    });

    it("escapes xml special characters", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = fs.readFileSync("./test/res/simple.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{simple_prop}");

        // replace tags

        const data = {
            simple_prop: "i'm special </w:r>"
        };

        const doc = await handler.process(template, data);

        fs.writeFileSync('/temp/simple - escape chars - output.docx', doc);

        const docText = await handler.getText(doc);
        expect(docText.trim()).to.be.equal("i'm special </w:r>");
    });

    it("replaces loops correctly", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = fs.readFileSync("./test/res/loop.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{#loop_prop}{simple_prop}!{/loop_prop}");

        const data = {
            loop_prop: [
                { simple_prop: 'first' },
                { simple_prop: 'second' }
            ]
        };

        const doc = await handler.process(template, data);

        fs.writeFileSync('/temp/simple loop - output.docx', doc);

        const docText = await handler.getText(doc);
        expect(docText).to.be.equal("first!second!");
    });

    it("replaces loops with no paragraphs between correctly", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = fs.readFileSync("./test/res/loop - same line.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).to.be.equal("{#loop_prop}{simple_prop}!{/loop_prop}");

        const data = {
            loop_prop: [
                { simple_prop: 'first' },
                { simple_prop: 'second' }
            ]
        };

        const doc = await handler.process(template, data);

        fs.writeFileSync('/temp/simple loop - same line - output.docx', doc);

        const docText = await handler.getText(doc);
        expect(docText).to.be.equal("first!second!");
    });

    it("replaces nested loops correctly", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = fs.readFileSync("./test/res/nested loop.docx");
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

        const doc = await handler.process(template, data);

        const docText = await handler.getText(doc);
        expect(docText).to.be.equal("hi!first!second!hi!third!forth!");
    });

    it("replaces nested loops fast enough?", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = fs.readFileSync("./test/res/nested loop with image.docx");
        
        const data = {
            loop_prop1: [
                {
                    loop_prop2: [
                        { simple_prop: 'some string' }
                    ]
                }
            ]
        };

        // generate lots of data
        const maxOuterLoop = 1000;
        const maxInnerLoop = 20;
        for (let i = 0; i < maxOuterLoop; i++) {
            data.loop_prop1[i] = { loop_prop2: [] };
            for (let j = 0; j < maxInnerLoop; j++) {
                data.loop_prop1[i].loop_prop2[j] = { simple_prop: (i * maxOuterLoop + j).toString() };
            }
        }

        const begin = Date.now();
        const doc = await handler.process(template, data);
        const end = Date.now();
        console.log(`==> nested loop speed test took ${end - begin}ms`);

        fs.writeFileSync('/temp/nested loop speed test - output.docx', doc);

    }).timeout(10000);
});