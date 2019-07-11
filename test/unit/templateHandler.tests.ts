import * as fs from 'fs';
import { TagDisposition } from 'src/compilation/tag';
import { TemplateHandler } from 'src/templateHandler';

describe(nameof(TemplateHandler), () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });    

    describe(nameof(TemplateHandler.prototype.parseTags), () => {

        it("returns parsed tags", async () => {

            const handler = new TemplateHandler();

            const template: Buffer = fs.readFileSync("./test/fixtures/files/loop - nested.docx");
            const templateText = await handler.getText(template);
            expect(templateText.trim()).toEqual("{#loop_prop1}hi!{#loop_prop2}{simple_prop}!{/loop_prop2}{/loop_prop1}");

            const tags = await handler.parseTags(template);

            expect(tags.length).toEqual(5);
            expect(tags[0].name).toEqual('loop_prop1');
            expect(tags[0].disposition).toEqual(TagDisposition.Open);
            expect(tags[1].name).toEqual('loop_prop2');
            expect(tags[1].disposition).toEqual(TagDisposition.Open);
            expect(tags[2].name).toEqual('simple_prop');
            expect(tags[2].disposition).toEqual(TagDisposition.SelfClosed);
            expect(tags[3].name).toEqual('loop_prop2');
            expect(tags[3].disposition).toEqual(TagDisposition.Close);
            expect(tags[4].name).toEqual('loop_prop1');
            expect(tags[4].disposition).toEqual(TagDisposition.Close);
        });
    });
});