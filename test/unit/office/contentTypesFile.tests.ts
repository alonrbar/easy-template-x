import { MimeType } from 'src/mimeType';
import { XmlParser } from 'src';
import { ContentTypesFile } from 'src/office/contentTypesFile';

describe(nameof(ContentTypesFile), () => {

    describe(nameof(ContentTypesFile.prototype.ensureContentType), () => {

        it('does not add the same type more than once', async () => {

            const fakeZip: any = {
                getFile: () => ({
                    getContentText: () => Promise.resolve(getContentTypesText())
                })
            };

            const contentTypes = new ContentTypesFile(fakeZip, new XmlParser());
            const countBefore = await contentTypes.count();
            expect(countBefore).toEqual(10);

            await contentTypes.ensureContentType(MimeType.Jpeg);
            await contentTypes.ensureContentType(MimeType.Jpeg);
            await contentTypes.ensureContentType(MimeType.Jpeg);

            const countAfter = await contentTypes.count();
            expect(countAfter).toEqual(11);
        });
    });
});

function getContentTypesText(): string {
    return `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
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