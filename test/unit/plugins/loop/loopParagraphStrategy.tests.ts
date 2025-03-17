import { PluginUtilities, Tag, TagDisposition, XmlTextNode } from "src";
import { LoopParagraphStrategy } from "src/plugins/loop/strategy";
import { parseXml } from "../../../testUtils";

describe(nameof(LoopParagraphStrategy), () => {

    describe(nameof(LoopParagraphStrategy.prototype.splitBefore), () => {

        it("when the closing loop tag's run has additional content before the tag, the extra content is preserved (bug #36)", () => {

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
            const pluginUtilities: PluginUtilities = {} as any;
            strategy.setUtilities(pluginUtilities);

            //
            // test
            //

            const { nodesToRepeat } = strategy.splitBefore(openTag, closeTag);

            const paragraph = nodesToRepeat[0];
            const run = paragraph?.childNodes?.[0];
            const wordTextNode = run?.childNodes?.[0];
            const textNode = wordTextNode?.childNodes?.[0] as XmlTextNode;
            expect(textNode).toBeTruthy();
            expect(textNode.textContent).toEqual('before');
        });
    });
});
