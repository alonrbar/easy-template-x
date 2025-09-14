import { MimeType } from "src/mimeType";
import { ContentTypesFile } from "src/office/contentTypesFile";
import { countOccurrences } from "src/utils/txt";
import { describe, expect, test } from "vitest";

describe(ContentTypesFile, () => {

    describe(ContentTypesFile.prototype.ensureContentType, () => {

        test('same type added multiple times - stored only once', async () => {

            const fakeZip: any = {
                getFile: () => ({
                    getContentText: () => Promise.resolve(getContentTypesText())
                })
            };

            const contentTypes = new ContentTypesFile(fakeZip);
            const xmlBefore = await contentTypes.xmlString();
            const countJpegBefore = countOccurrences(xmlBefore, 'image/jpeg');
            expect(countJpegBefore).toEqual(0);

            await contentTypes.ensureContentType(MimeType.Jpeg);
            await contentTypes.ensureContentType(MimeType.Jpeg);
            await contentTypes.ensureContentType(MimeType.Jpeg);

            const xmlAfter = await contentTypes.xmlString();
            const countJpegAfter = countOccurrences(xmlAfter, 'image/jpeg');
            expect(countJpegAfter).toEqual(1);
        });

        test('multiple extensions map to the same mime type is allowed', async () => {

            // User added a file with the .jpg extension that maps to the png
            // mime type - happens in real life.
            const extraElements = `
                <Default Extension="jpg" ContentType="image/png"/>
            `;

            const fakeZip: any = {
                getFile: () => ({
                    getContentText: () => Promise.resolve(getContentTypesText(extraElements))
                })
            };

            const contentTypes = new ContentTypesFile(fakeZip);
            const xmlBefore = await contentTypes.xmlString();
            const countPngMimeBefore = countOccurrences(xmlBefore, 'image/png');
            expect(countPngMimeBefore).toEqual(1);

            const countPngExtensionBefore = countOccurrences(xmlBefore, 'Extension="png"');
            const countJpegExtensionBefore = countOccurrences(xmlBefore, 'Extension="jpg"');
            expect(countPngExtensionBefore).toEqual(0);
            expect(countJpegExtensionBefore).toEqual(1);

            // Add png mime type - should add a new element with the .png extension
            await contentTypes.ensureContentType(MimeType.Png);

            const xmlAfter = await contentTypes.xmlString();
            const countPngMimeAfter = countOccurrences(xmlAfter, 'image/png');
            expect(countPngMimeAfter).toEqual(2);

            const countPngExtensionAfter = countOccurrences(xmlAfter, 'Extension="png"');
            const countJpegExtensionAfter = countOccurrences(xmlAfter, 'Extension="jpg"');
            expect(countPngExtensionAfter).toEqual(1);
            expect(countJpegExtensionAfter).toEqual(1);
        });
    });
});

function getContentTypesText(extraElements: string = ''): string {
    return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            ${extraElements}
            <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
            <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
            <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
            <Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>
            <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
            <Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
            <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
            <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
        </Types>
    `;
}
