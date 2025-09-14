import { MimeType } from "src/mimeType";
import { MediaFiles } from "src/office/mediaFiles";
import { Zip } from "src/zip";
import { readResource } from "test/testUtils";
import { describe, expect, test } from "vitest";

describe(MediaFiles, () => {

    describe(MediaFiles.prototype.add, () => {

        test('adds a file', async () => {

            const docFile = readResource("two images.docx");
            const zip = await Zip.load(docFile);
            const mediaFiles = new MediaFiles(zip);

            let filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(2);

            const image = readResource("panda1.jpg");
            const addedFilePath = await mediaFiles.add(image, MimeType.Jpeg);
            expect(addedFilePath).toEqual('word/media/image1.jpg');

            filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(3);
        });

        test('adds the same file only once', async () => {

            const docFile = readResource("two images.docx");
            const zip = await Zip.load(docFile);
            const mediaFiles = new MediaFiles(zip);

            let filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(2);

            const mediaToAdd = "panda1.jpg";

            // add #1
            const image1 = readResource(mediaToAdd);
            const addedFilePath1 = await mediaFiles.add(image1, MimeType.Jpeg);
            expect(addedFilePath1).toEqual('word/media/image1.jpg');

            filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(3);

            // add #2
            const image2 = readResource(mediaToAdd);
            const addedFilePath2 = await mediaFiles.add(image2, MimeType.Jpeg);
            expect(addedFilePath2).toEqual('word/media/image1.jpg');

            filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(3);
        });
    });
});
