import { MimeType } from "src/mimeType";
import { ImageContent } from "src/plugins/image";
import { TemplateHandler } from "src/templateHandler";
import { Zip } from "src/zip";
import { range, readResource } from "../testUtils";
import { readFixture } from "./fixtureUtils";

describe('image fixtures', () => {

    test("simple", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("simple.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile,
            height: 325,
            width: 600
        };
        const data = {
            simple_prop: imageData
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('image - simple - output.docx', doc);
    });

    test("alt text", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("simple.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData = {
            _type: 'image',
            format: MimeType.Jpeg,
            altText: "There is no spoon.",
            source: imageFile,
            height: 325,
            width: 600
        };
        const data = {
            simple_prop: imageData
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('image - alt text - output.docx', doc);
    });

    test("transparency", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("simple.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            transparencyPercent: 33,
            source: imageFile,
            height: 325,
            width: 600
        };
        const data = {
            simple_prop: imageData
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('image - transparency - output.docx', doc);
    });

    test("add to an existing image", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("image - existing image.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile,
            height: 325,
            width: 600
        };
        const data = {
            NewImage: imageData
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile('image - existing image - output.docx', doc);
    });

    test("two different images", async () => {

        //
        // NOTICE:
        //
        // When running this test alone the snapshot matching fails since for
        // some reason the order of the rel ID generation changes. Running the
        // entire file though should always pass the snapshot matching
        // successfully.
        //

        const handler = new TemplateHandler();

        const template = readFixture("loop - simple.docx");
        const imageFile1 = readResource("panda1.jpg");
        const imageFile2 = readResource("panda2.png");

        const imageData1: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile1,
            height: 325,
            width: 600
        };
        const imageData2: ImageContent = {
            _type: 'image',
            format: MimeType.Png,
            source: imageFile2,
            height: 300,
            width: 300
        };
        const data: any = {
            loop_prop: [
                { simple_prop: imageData1 },
                { simple_prop: imageData2 }
            ]
        };

        const doc = await handler.process(template, data);

        const docXml = await handler.getXml(doc);
        expect(docXml).toMatchSnapshot();

        // writeTempFile(doc, 'image - two - output.docx');
    });

    test("start with an existing image and run twice the same template, each time with a different image", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("image - existing image 2.docx");
        const imageFile1 = readResource("panda1.jpg");
        const imageFile2 = readResource("panda2.png");

        const imageData1: ImageContent = {
            _type: 'image',
            format: MimeType.Png,
            source: imageFile1,
            height: 325,
            width: 600
        };
        const imageData2: ImageContent = {
            _type: 'image',
            format: MimeType.Png,
            source: imageFile2,
            height: 300,
            width: 300
        };

        const data1: any = {
            Tag1: imageData1,
            Tag2: "{NewTag1} {NewTag2}"
        };

        const data2: any = {
            NewTag1: imageData2,
            NewTag2: "Done"
        };

        // Run the first time - should insert an image and two new tags
        const doc1 = await handler.process(template, data1);

        const docXml1 = await handler.getXml(doc1);
        expect(docXml1).toMatchSnapshot();

        // Run the second time - should insert another image
        const doc2 = await handler.process(doc1, data2);

        const docXml2 = await handler.getXml(doc2);
        expect(docXml2).toMatchSnapshot();

        // writeTempFile('image - run twice - output 1.docx', doc1);
        // writeTempFile('image - run twice - output 2.docx', doc2);
    });

    test("insert the same image to the archive multiple times - stored only once", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("loop - simple.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile,
            height: 325,
            width: 600
        };
        const data: any = {
            loop_prop: [
                { simple_prop: imageData },
                { simple_prop: Object.assign({}, imageData, { height: 150, width: 300 }) },
                { simple_prop: Object.assign({}, imageData, { height: 200, width: 400 }) }
            ]
        };

        const doc = await handler.process(template, data);

        // assert
        const zip = await Zip.load(doc);
        const jpegFiles = zip.listFiles().filter(f => f.endsWith('.jpg'));
        expect(jpegFiles).toHaveLength(1);

        // writeTempFile(doc, 'image - loop same - output.docx');
    });

    test("using the same template handler to add the same image to two different files works", async () => {

        const handler = new TemplateHandler();

        const template1 = readFixture("simple.docx");
        const template2 = readFixture("simple.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile,
            height: 325,
            width: 600
        };
        const data: any = {
            simple_prop: imageData
        };

        const doc1 = await handler.process(template1, data);
        const doc2 = await handler.process(template2, data);

        // assert
        const zip1 = await Zip.load(doc1);
        const jpegFiles1 = zip1.listFiles().filter(f => f.endsWith('.jpg'));
        expect(jpegFiles1).toHaveLength(1);

        const zip2 = await Zip.load(doc2);
        const jpegFiles2 = zip2.listFiles().filter(f => f.endsWith('.jpg'));
        expect(jpegFiles2).toHaveLength(1);

        // writeTempFile(doc1, 'image - two files 1 - output.docx');
        // writeTempFile(doc2, 'image - two files 2 - output.docx');
    });

    test("image markup generation is fast enough", async () => {

        const handler = new TemplateHandler();

        const template = readFixture("loop - simple.docx");
        const imageFile = readResource("panda1.jpg");

        const imageData: ImageContent = {
            _type: 'image',
            format: MimeType.Jpeg,
            source: imageFile,
            height: 50,
            width: 100
        };
        const data: any = {
            loop_prop: range(1, 1000).map(() => ({ simple_prop: imageData }))
        };

        await handler.process(template, data);

    }, 3 * 1000);
});
