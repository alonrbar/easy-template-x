import { LoopParagraphStrategy } from 'src/plugins/loop/strategy';
import { parseXml } from '../../../testUtils';
import { DocxParser, XmlParser, PluginUtilities, Tag, TagDisposition, XmlTextNode } from 'src';

describe('nameof(LoopParagraphStrategy)', () => {

    describe('nameof(LoopParagraphStrategy.prototype.splitBefore)', () => {

        it("when the loop tag's run has additional content before the tag, the extra content is preserved (bug #36)", () => {

            //
            // prepare
            //

            const body = parseXml(`
                <w:body>
                    <w:p>
                        <w:r>
                            <w:t>{#loop}</w:t>
                        </w:r>
                        <w:r>
                            <w:t>before</w:t>
                            <w:t>{/loop}</w:t>
                            <w:t>after</w:t>
                        </w:r>
                    </w:p>
                </w:body>
            `);

            const openTag: Tag = {
                name: 'loop',
                disposition: TagDisposition.Open,
                rawText: '{#loop}',
                xmlTextNode: body.childNodes[0].childNodes[0].childNodes[0].childNodes[0] as XmlTextNode
            };
            const closeTag: Tag = {
                name: 'loop',
                disposition: TagDisposition.Open,
                rawText: '{/loop}',
                xmlTextNode: body.childNodes[0].childNodes[1].childNodes[1].childNodes[0] as XmlTextNode
            };
            expect(openTag.xmlTextNode.textContent).toEqual('{#loop}');
            expect(closeTag.xmlTextNode.textContent).toEqual('{/loop}');

            const strategy = new LoopParagraphStrategy();
            const pluginUtilities: PluginUtilities = {
                docxParser: new DocxParser(new XmlParser())
            } as any;
            strategy.setUtilities(pluginUtilities);

            //
            // test
            //

            const { nodesToRepeat } = strategy.splitBefore(openTag, closeTag);
            expect(nodesToRepeat[0].childNodes?.length).toBeTruthy(); // TODO: improve and add assertions
        });
    });
});
