import { expect } from 'chai';
import * as fs from 'fs';
import { TagDisposition } from 'src/compilation/tag';
import { TemplateHandler } from 'src/templateHandler';
import { randomParagraphs, randomWords } from './testUtils';

// tslint:disable:no-unused-expression object-literal-key-quotes

describe(nameof(TemplateHandler), () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });

    describe(nameof(TemplateHandler.prototype.process), () => {

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

        it("replaces table row loops correctly", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - table.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).to.be.equal("{#loop}Some Text{prop}{/loop}");

            const data = {
                loop: [
                    { prop: 'first' },
                    { prop: 'second' },
                    { prop: 'third' }
                ]
            };

            const doc = await handler.process(template, data);

            fs.writeFileSync('/temp/loop - table - output.docx', doc);

            // const docText = await handler.getText(doc);
            // expect(docText).to.be.equal("first!second!");
        });

        it("replaces a loop with open and close tag in the same paragraph correctly", async () => {

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

        it("replaces a loop whose items have several properties", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - multi props.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).to.be.equal(
                "{#loop_prop}{simple_prop1}!{simple_prop2}!{simple_prop3}!{/loop_prop}"
            );

            const data = {
                loop_prop: [
                    {
                        simple_prop1: 'first',
                        simple_prop2: 'second',
                        simple_prop3: 'third'
                    },
                    {
                        simple_prop1: 'forth',
                        simple_prop2: 'fifth',
                        simple_prop3: 'sixth'
                    }
                ]
            };

            const doc = await handler.process(template, data);

            fs.writeFileSync('/temp/loop - multi props - output.docx', doc);

            const docText = await handler.getText(doc);
            expect(docText).to.be.equal("first!second!third!forth!fifth!sixth!");
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

        it("replaces nested loops fast enough", async () => {

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
            console.log(`==> nested loop speed test took ${end - begin}ms`); // tslint:disable-line:no-console

            fs.writeFileSync('/temp/nested loop speed test - output.docx', doc);

        }).timeout(10000);

        it("handles a real life template (in Hebrew)", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/real life - he.docx");

            // const data = {
            //     'תלמידים': [
            //         {
            //             'שם_התלמיד': 'אלון בר',
            //             'קבוצות': [                 
            //                 {
            //                     'שם_הקבוצה': 'אנגלית',
            //                     'שם_המורה': 'משה משה',
            //                     'הערכה מילולית': 'טעון שיפור'
            //                 }
            //             ]
            //         }]
            // };

            const data: any = {
                'תלמידים': [],
                'עמוד חדש': '<w:br w:type="page"/>'
            };

            const studentsCount = 3;
            const groupsCount = 3;
            for (let i = 0; i < studentsCount; i++) {
                const student: any = {
                    'שם התלמיד': randomWords(),
                    'קבוצות': []
                };

                for (let j = 0; j < groupsCount; j++) {
                    student['קבוצות'].push({
                        'שם הקבוצה': randomWords(),
                        'שם המורה': randomWords(2),
                        'הערכה מילולית': randomParagraphs(2)
                    });
                }
                data['תלמידים'].push(student);
            }

            const begin = Date.now();
            const doc = await handler.process(template, data);
            const end = Date.now();
            console.log(`==> real life test took ${end - begin}ms`); // tslint:disable-line:no-console

            fs.writeFileSync('/temp/real life - output.docx', doc);
        }).timeout(10000);
    });

    describe(nameof(TemplateHandler.prototype.parseTags), () => {

        it("returns parsed tags", async () => {
            
            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/nested loop.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).to.be.equal("{#loop_prop1}hi!{#loop_prop2}{simple_prop}!{/loop_prop2}{/loop_prop1}");

            const tags = await handler.parseTags(template);

            expect(tags.length).to.equal(5);
            expect(tags[0].name).to.eql('loop_prop1');
            expect(tags[0].disposition).to.eql(TagDisposition.Open);
            expect(tags[1].name).to.eql('loop_prop2');
            expect(tags[1].disposition).to.eql(TagDisposition.Open);
            expect(tags[2].name).to.eql('simple_prop');
            expect(tags[2].disposition).to.eql(TagDisposition.SelfClosed);
            expect(tags[3].name).to.eql('loop_prop2');
            expect(tags[3].disposition).to.eql(TagDisposition.Close);
            expect(tags[4].name).to.eql('loop_prop1');
            expect(tags[4].disposition).to.eql(TagDisposition.Close);
        });
    });
});