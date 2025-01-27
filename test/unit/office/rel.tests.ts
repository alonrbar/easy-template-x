import { MimeType } from 'src/mimeType';
import { RelsFile } from 'src/office/relsFile';
import { XmlParser } from 'src';

describe(RelsFile, () => {

    describe(RelsFile.prototype.add, () => {

        it('returns the same rel for the same target', async () => {

            const fakeZip: any = {
                getFile: (): any => null
            };

            const rels = new RelsFile('word/document.xml', fakeZip, new XmlParser());

            const rel1 = await rels.add('my image.jpeg', MimeType.Jpeg);
            const rel2 = await rels.add('my image.jpeg', MimeType.Jpeg);

            expect(rel1).toEqual(rel2);
        });
    });
});
