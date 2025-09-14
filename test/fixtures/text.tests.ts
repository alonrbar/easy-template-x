import { TemplateHandler } from "src/templateHandler";
import { XmlNodeType } from "src/xml";
import { describe, expect, it } from "vitest";
import { getChildNode } from "../testUtils";
import { readFixture } from "./fixtureUtils";

describe('text tag fixtures', () => {

    it("replaces a single tag", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = readFixture("simple.docx");
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

    it("removes empty tags", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = readFixture("empty tag.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).toEqual("{}{ }");

        // replace tags

        const data = {};

        const doc = await handler.process(template, data);

        const docText = await handler.getText(doc);
        expect(docText.trim()).toEqual("");
    });

    it("skips empty tags if skipEmptyTags is true", async () => {

        const handler = new TemplateHandler({
            skipEmptyTags: true,
        });

        // load the template

        const template: Buffer = readFixture("simple.docx");
        const templateText = await handler.getText(template);
        expect(templateText.trim()).toEqual("{simple_prop}");

        // replace tags

        const data = {
            simple_prop: ''
        };

        const doc = await handler.process(template, data);

        const docText = await handler.getText(doc);
        expect(docText.trim()).toEqual("{simple_prop}");
    });

    it("handles numeric values", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = readFixture("simple.docx");
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

        const template: Buffer = readFixture("simple.docx");
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

        // writeTempFile('simple - multiline - output.docx', doc);
    });

    it("escapes xml special characters", async () => {

        const handler = new TemplateHandler();

        // load the template

        const template: Buffer = readFixture("simple.docx");
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

        // writeTempFile('simple - escape chars - output.docx', doc);
    });

    it("replaces tags in attributes", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("image - placeholder - two tags.docx");

        const templateXml = await handler.getXml(template);
        const imagePropertiesNodeBefore = getChildNode(templateXml, XmlNodeType.General, 0, 0, 1, 1, 0, 2);
        const altTextAttributeBefore = imagePropertiesNodeBefore.attributes?.["descr"];
        expect(altTextAttributeBefore).toEqual("Hello {Placeholder 1} {Placeholder 2}");

        const data = {
            "Placeholder 1": "World"
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        const imagePropertiesNodeAfter = getChildNode(docXml, XmlNodeType.General, 0, 0, 1, 1, 0, 2);
        const altTextAttributeAfter = imagePropertiesNodeAfter.attributes?.["descr"];
        expect(altTextAttributeAfter).toEqual("Hello World ");
    });

    it("removes attributes if the replacement is empty", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("image - placeholder.docx");

        const templateXml = await handler.getXml(template);
        const imagePropertiesNodeBefore = getChildNode(templateXml, XmlNodeType.General, 0, 0, 1, 1, 0, 2);
        const altTextAttributeBefore = imagePropertiesNodeBefore.attributes?.["descr"];
        expect(altTextAttributeBefore).toEqual("{My Tag 2}");

        const data = {};

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        const imagePropertiesNodeAfter = getChildNode(docXml, XmlNodeType.General, 0, 0, 1, 1, 0, 2);
        const altTextAttributeAfter = imagePropertiesNodeAfter.attributes?.["descr"];
        expect(altTextAttributeAfter).toBeUndefined();
    });
});
