import * as fs from 'fs';
import { TagDisposition } from 'src/compilation/tag';
import { TemplateHandler } from 'src/templateHandler';
import { randomParagraphs, randomWords } from './testUtils';

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
            expect(templateText.trim()).toEqual("{simple_prop}");

            // replace tags

            const data = {
                simple_prop: 'hello world'
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText.trim()).toEqual("hello world");
        });

        it("handles numeric values", async () => {

            const handler = new TemplateHandler();

            // load the template

            const template: Buffer = fs.readFileSync("./test/res/simple.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{simple_prop}");

            // replace tags

            const data = {
                simple_prop: 123
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText.trim()).toEqual("123");
        });

        it("replaces newlines with <w:br/>", async () => {

            const handler = new TemplateHandler();

            // load the template

            const template: Buffer = fs.readFileSync("./test/res/simple.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{simple_prop}");

            // replace tags

            const data = {
                simple_prop: 'first line\nsecond line'
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText.trim()).toEqual("first linesecond line");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/simple - multiline - output.docx', doc);
        });

        it("escapes xml special characters", async () => {

            const handler = new TemplateHandler();

            // load the template

            const template: Buffer = fs.readFileSync("./test/res/simple.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{simple_prop}");

            // replace tags

            const data = {
                simple_prop: "i'm special </w:r>"
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText.trim()).toEqual("i'm special </w:r>");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/simple - escape chars - output.docx', doc);
        });

        it("replaces loops correctly", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - simple.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop}{simple_prop}!{/loop_prop}");

            const data = {
                loop_prop: [
                    { simple_prop: 'first' },
                    { simple_prop: 'second' }
                ]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("first!second!");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/simple loop - output.docx', doc);
        });

        it("replaces table row loops correctly", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - table.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop}Repeat this text {prop} And this also…{/loop}");

            const data = {
                outProp: 'I am out!',
                loop: [
                    { prop: 'first' },
                    { prop: 'second' }
                ]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("Repeat this text first And this also…Repeat this text second And this also…");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/loop - table - output.docx', doc);
        });

        it("replaces list loops correctly", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - list.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop1}Hi{#loop2}{prop}{/loop2}{/loop1}");

            const data = {
                loop1: [
                    {
                        loop2: [
                            { prop: 'first' },
                            { prop: 'second' }
                        ]
                    },
                    {
                        loop2: [
                            { prop: 'third' },
                            { prop: 'forth' }
                        ]
                    }]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("HifirstsecondHithirdforth");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/loop - list - output.docx', doc);
        });

        it("replaces a loop with open and close tag in the same paragraph correctly", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - same line.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop}{simple_prop}!{/loop_prop}");

            const data = {
                loop_prop: [
                    { simple_prop: 'first' },
                    { simple_prop: 'second' }
                ]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("first!second!");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/simple loop - same line - output.docx', doc);
        });

        it("replaces a loop whose items have several properties", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - multi props.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual(
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

            const docText = await handler.getText(doc);
            expect(docText).toEqual("first!second!third!forth!fifth!sixth!");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/loop - multi props - output.docx', doc);
        });

        it("replaces nested loops correctly", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - nested.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop1}hi!{#loop_prop2}{simple_prop}!{/loop_prop2}{/loop_prop1}");

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
            expect(docText).toEqual("hi!first!second!hi!third!forth!");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // fs.writeFileSync('/temp/nested loop - output.docx', doc);
        });

        it("replaces nested loops fast enough", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - nested with image.docx");

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

            await handler.process(template, data);

            // fs.writeFileSync('/temp/nested loop speed test - output.docx', doc);
        }, 5 * 1000);

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

            await handler.process(template, data);

            // fs.writeFileSync('/temp/real life - output.docx', doc);
        });
    });

    describe(nameof(TemplateHandler.prototype.parseTags), () => {

        it("returns parsed tags", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/res/loop - nested.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop1}hi!{#loop_prop2}{simple_prop}!{/loop_prop2}{/loop_prop1}");

            const tags = await handler.parseTags(template);

            expect(tags.length).toEqual(5);
            expect(tags[0].name).toEqual('loop_prop1');
            expect(tags[0].disposition).toEqual(TagDisposition.Open);
            expect(tags[1].name).toEqual('loop_prop2');
            expect(tags[1].disposition).toEqual(TagDisposition.Open);
            expect(tags[2].name).toEqual('simple_prop');
            expect(tags[2].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[3].name).toEqual('loop_prop2');
            expect(tags[3].disposition).toEqual(TagDisposition.Close);
            expect(tags[4].name).toEqual('loop_prop1');
            expect(tags[4].disposition).toEqual(TagDisposition.Close);
        });
    });
});