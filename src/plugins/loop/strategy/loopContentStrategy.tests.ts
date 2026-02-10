import { TagDisposition, TagPlacement, TextNodeTag, XmlTextNode } from "src";
import { LoopContentStrategy } from "./loopContentStrategy";
import { parseXml } from "test/testUtils";
import { describe, expect, it } from "vitest";

describe(LoopContentStrategy, () => {

    describe(LoopContentStrategy.prototype.splitBefore, () => {

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

            const openTag: TextNodeTag = {
                name: 'loop',
                placement: TagPlacement.TextNode,
                disposition: TagDisposition.Open,
                rawText: '{#loop}',
                xmlTextNode: body.childNodes[0].childNodes[0].childNodes[0].childNodes[0] as XmlTextNode
            };
            const closeTag: TextNodeTag = {
                placement: TagPlacement.TextNode,
                name: 'loop',
                disposition: TagDisposition.Open,
                rawText: '{/loop}',
                xmlTextNode: body.childNodes[0].childNodes[1].childNodes[1].childNodes[0] as XmlTextNode
            };
            expect(openTag.xmlTextNode.textContent).toEqual('{#loop}');
            expect(closeTag.xmlTextNode.textContent).toEqual('{/loop}');

            const strategy = new LoopContentStrategy();

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
