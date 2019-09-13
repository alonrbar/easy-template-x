import { MimeType } from 'src/mimeType';
import { Rels } from 'src/office/rels';
import { XmlParser } from 'src';

describe(nameof(Rels), () => {

    describe(nameof(Rels.prototype.add), () => {

        it('returns the same rel for the same target', async () => {

            const fakeZip: any = {
                getFile: (): any => null
            };

            const rels = new Rels('word/document.xml', fakeZip, new XmlParser());

            const rel1 = await rels.add('my image.jpeg', MimeType.Jpeg);
            const rel2 = await rels.add('my image.jpeg', MimeType.Jpeg);

            expect(rel1).toEqual(rel2);
        });        
    });
});