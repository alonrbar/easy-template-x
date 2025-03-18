import { MimeType } from "src/mimeType";
import { RelType } from "src/office";
import { TemplateHandler } from "src/templateHandler";
import { Zip } from "src/zip";
import { readResource } from "../testUtils";
import { readFixture } from "./fixtureUtils";

describe('header and footer fixtures', () => {

    it("replaces simple tags", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = readFixture("header and footer.docx");
        const data = {
            "my header": "I'm in the header!",
            "my body": "hello world",
            "my footer": "Hello from down below"
        };

        const doc = await handler.process(template, data);

        const docText = await handler.getText(doc);
        expect(docText.trim()).toEqual("hello world");

        const headerText = await handler.getText(doc, RelType.Header);
        expect(headerText.trim()).toEqual("I'm in the header!");

        const footerText = await handler.getText(doc, RelType.Footer);
        expect(footerText.trim()).toEqual("Hello from down below");
    });

    it("replaces loop tags", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = readFixture("header and footer - loop.docx");
        const data = {
            "header loop": [
                { "my header": "I'm in the header!" },
                { "my header": "Me too!" }
            ],
            "body loop": [
                { "my body": "hello world1" },
                { "my body": "hello world2" }
            ],
            "footer loop": [
                { "my footer": "Hello from down below." },
                { "my footer": "How do you do?" }
            ]
        };

        const doc = await handler.process(template, data);

        const docText = await handler.getText(doc);
        expect(docText.trim()).toEqual("hello world1hello world2");

        const headerText = await handler.getText(doc, RelType.Header);
        expect(headerText.trim()).toEqual("I'm in the header!Me too!");

        const footerText = await handler.getText(doc, RelType.Footer);
        expect(footerText.trim()).toEqual("Hello from down below.How do you do?");

        // writeTempFile('header and footer - loop - output.docx', doc);
    });

    it("replaces image tags", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = readFixture("header and footer.docx");
        const headerImageFile = readResource("panda1.jpg");
        const footerImageFile = readResource("panda2.png");

        const data = {
            "my header": {
                _type: 'image',
                format: MimeType.Jpeg,
                source: headerImageFile,
                height: 100,
                width: 200
            },
            "my body": "hello world",
            "my footer": {
                _type: 'image',
                format: MimeType.Png,
                source: footerImageFile,
                height: 100,
                width: 100
            }
        };

        const doc = await handler.process(template, data);

        // assert content changed

        const docText = await handler.getText(doc);
        expect(docText.trim()).toEqual("hello world");

        const headerXml = await handler.getXml(doc, RelType.Header);
        expect(headerXml).toMatchSnapshot();

        const footerXml = await handler.getXml(doc, RelType.Footer);
        expect(footerXml).toMatchSnapshot();

        // assert image binary added

        const zip = await Zip.load(doc);

        const jpegFiles = zip.listFiles().filter(f => f.endsWith('.jpg'));
        expect(jpegFiles).toHaveLength(1);

        const pngFiles = zip.listFiles().filter(f => f.endsWith('.png'));
        expect(pngFiles).toHaveLength(1);

        // writeTempFile('header and footer - image - output.docx', doc);
    });

    it("processes header and footer references in the middle of the document", async () => {

        const handler = new TemplateHandler();

        const template: Buffer = readFixture("header and footer - middle reference.docx");

        const headerTextBefore = await handler.getText(template, RelType.Header);
        expect(headerTextBefore.trim()).toContain("client.court.courtFile");
        expect(headerTextBefore.trim()).not.toContain("TEST");

        const data = {
            "client.court.courtFile": "TEST",
        };

        const doc = await handler.process(template, data);

        const headerTextAfter = await handler.getText(doc, RelType.Header);
        expect(headerTextAfter.trim()).toContain("TEST");
        expect(headerTextAfter.trim()).not.toContain("client.court.courtFile");

        // writeTempFile('invisible header - output.docx', doc);
    });
});
