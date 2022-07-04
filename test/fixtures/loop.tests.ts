import { TemplateHandler } from 'src/templateHandler';
import { readFixture } from './fixtureUtils';

describe('loop fixtures', () => {

    it("replaces paragraph loops correctly", async () => {

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

    it("replaces table row loops correctly", async () => {

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

    it("replaces list loops correctly", async () => {

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

    it("supports custom loop delimiters", async () => {

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

    it("supports boolean conditions", async () => {

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

    it("ignores the name of the closing tag", async () => {

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

    it("replaces a loop with open and close tag in the same paragraph correctly", async () => {

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

    it("replaces a loop whose items have several properties", async () => {

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

    it("replaces nested loops correctly", async () => {

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

    it("replaces nested conditions correctly", async () => {

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

    it("replaces a loop inside a condition inside a loop correctly", async () => {

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

    it("replaces nested loops fast enough", async () => {

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
