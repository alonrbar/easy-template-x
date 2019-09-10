import * as fs from 'fs';
import * as JSZip from 'jszip';
import { MediaFiles } from 'src/office/mediaFiles';
import { MimeType } from 'src/mimeType';

describe(nameof(MediaFiles), () => {

    describe(nameof(MediaFiles.prototype.add), () => {

        it('adds a file', async () => {

            const docFile = fs.readFileSync("./test/unit/res/two images.docx");
            const zip = await JSZip.loadAsync(docFile);
            const mediaFiles = new MediaFiles(zip);

            let filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(2);

            const image = fs.readFileSync("./test/unit/res/panda.jpg");
            const addedFilePath = await mediaFiles.add(image, MimeType.Jpeg);
            expect(addedFilePath).toEqual('word/media/media1.jpg');

            filesCount = await mediaFiles.count();
            expect(filesCount).toEqual(3);
        });
    });
});