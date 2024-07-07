import { TemplateHandler } from 'src/templateHandler';
import { removeWhiteSpace } from 'test/testUtils';
import { readFixture } from './fixtureUtils';

describe('loop fixtures', () => {

    describe('base', () => {

        test("simple paragraph loops", async () => {

            const handler = new TemplateHandler();

            const template = readFixture('loop - simple.docx');
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

            // writeTempFile('simple loop - output.docx', doc);
        });

        test("simple table row loops", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - table.docx");
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

            // writeTempFile('loop - table - output.docx', doc);
        });

        test("simple list loops", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - list.docx");
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

            // writeTempFile('loop - list - output.docx', doc);
        });

        test("custom loop delimiters", async () => {

            const handler = new TemplateHandler({
                delimiters: {
                    containerTagOpen: '>>>',
                    containerTagClose: '<<<'
                }
            });

            const template = readFixture('loop - custom delimiters.docx');
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{>>> loop_prop}{simple_prop}!{<<< loop_prop}");

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

            // writeTempFile('loop - custom delimiters - output.docx', doc);
        });

        test("boolean conditions", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - conditions.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop1}hi!{#condition1}yes!{/}{#condition2}no!{/}{/}");

            const data = {
                loop_prop1: [
                    {
                        condition1: true,
                        condition2: false
                    },
                    {
                        condition1: false,
                        condition2: true
                    },
                    {
                        condition1: false,
                        condition2: false
                    },
                    {
                        condition1: true,
                        condition2: true
                    }
                ]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("hi!yes!hi!no!hi!hi!yes!no!");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // writeTempFile('loop - conditions - output.docx', doc);
        });

        test("ignore closing tag name", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - nested - ignore closing tag name.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop1}hi!{#loop_prop2}{simple_prop}!{/some_name}{/}");

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

            // writeTempFile('nested loop ignore closing tag name - output.docx', doc);
        });

        test("multiple props in the same iteration", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - multi props.docx");
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

            // writeTempFile('loop - multi props - output.docx', doc);
        });
    });

    describe('nested', () => {

        test("simple nested loops", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - nested.docx");
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

            // writeTempFile('nested loop - output.docx', doc);
        });

        test("simple nested conditions", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - condition in condition.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{# condition a}{# condition b}{yes}{/}{# condition c}{no}{/}{/}");

            const data = {
                "condition a": true,
                "condition b": true,
                "condition c": false,
                "yes": "Yes!",
                "no": "Oh no!",
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("Yes!");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // writeTempFile('loop - condition in condition - output.docx', doc);
        });

        test("a loop inside a condition inside a loop", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - nested with condition.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{# teams}{# display}{name}:{# members}First Name: {name}, Last Name: {surname}{/ members};{/}{/ teams}");

            const data = {
                "teams": [
                    {
                        "display": true,
                        "name": "Team A",
                        "members": [
                            { "name": "Bryson", "surname": "Pike" },
                            { "name": "Beatriz", "surname": "Schmitt" },
                        ]
                    },
                    {
                        "display": false,
                        "name": "Team B",
                        "members": [
                            { "name": "Charis", "surname": "Hilton" },
                            { "name": "John", "surname": "Plant" },
                        ]
                    },
                    {
                        "display": true,
                        "name": "Team C",
                        "members": [
                            { "name": "Fionn", "surname": "Lyons" },
                            { "name": "Pedro", "surname": "Compton" }
                        ]
                    }
                ]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("Team A:First Name: Bryson, Last Name: Pike;First Name: Beatriz, Last Name: Schmitt;Team C:First Name: Fionn, Last Name: Lyons;First Name: Pedro, Last Name: Compton;");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // writeTempFile('loop - nested with condition - output.docx', doc);
        });

        test("nested loops replacement is fast enough", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - nested with image.docx");

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

            // writeTempFile('nested loop speed test - output.docx', doc);
        }, 5 * 1000);
    });

    describe('paragraph', () => {

        test("open and close tag in the same paragraph", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - same line.docx");
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

            // writeTempFile('simple loop - same line - output.docx', doc);
        });
    });

    describe('table', () => {

        test("loopOver option", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - table - loopOver.docx");
            const templateText = await handler.getText(template);
            expect(removeWhiteSpace(templateText)).toEqual(removeWhiteSpace(`
                [Row1]{#loop1}{val}{/loop1}{#loop2}{val}{/loop2}
                [Row2]{#loop3[loopOver:“row”]}{val}{/loop3}
                [Row3]{#loop4[loopOver:“content”]}{val}{/loop4}
            `));

            const data = {
                loop1: [
                    { val: 'val1' },
                    { val: 'val2' }
                ],
                loop2: [
                    { val: 'val3' },
                    { val: 'val4' }
                ],
                loop3: [
                    { val: 'val5' },
                    { val: 'val6' }
                ],
                loop4: [
                    { val: 'val7' },
                    { val: 'val8' }
                ]
            };

            const doc = await handler.process(template, data);

            const docText = await handler.getText(doc);
            expect(docText).toEqual("[Row1]val1val2val3val4[Row2]val5[Row2]val6[Row3]val7val8");

            const docXml = await handler.getXml(doc);
            expect(docXml).toMatchSnapshot();

            // writeTempFile('loop - table - loopOver - output.docx', doc);
        });
    });
});
