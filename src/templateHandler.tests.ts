import { TagDisposition } from "src/compilation/tag";
import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it, test, vi } from "vitest";
import { readFixture } from "test/fixtures/fixtureUtils";
import { TemplateExtension } from "src/extensions";
import { readResource } from "test/testUtils";
import { TemplateData } from "src";

const beforeCompilationExecute = vi.fn();
const afterCompilationExecute = vi.fn();
const setUtilities = vi.fn();

class BeforeCompilationExtension extends TemplateExtension {
    public execute = beforeCompilationExecute;
    public setUtilities = setUtilities;
}

class AfterCompilationExtension extends TemplateExtension {
    public execute = afterCompilationExecute;
    public setUtilities = setUtilities;
}

describe(TemplateHandler, () => {

    it(`constructor doesn't throw`, () => {
        new TemplateHandler();
    });

    describe(TemplateHandler.prototype.process, () => {
        
        test('extensions are called', async () => {
            const beforeCompilationExtension = new BeforeCompilationExtension();
            const afterCompilationExtension = new AfterCompilationExtension();

            const handler = new TemplateHandler({
                extensions: {
                    beforeCompilation: [
                        beforeCompilationExtension
                    ],
                    afterCompilation: [
                        afterCompilationExtension
                    ]
                }
            });

            // load the docx file
            const docFile = readResource("two images.docx");

            const data: TemplateData = {};

            await handler.process(docFile, data);

            expect(setUtilities).toHaveBeenCalledTimes(2);
            expect(beforeCompilationExecute).toHaveBeenCalledTimes(1);
            expect(afterCompilationExecute).toHaveBeenCalledTimes(1);
        });
    });

    describe(TemplateHandler.prototype.parseTags, () => {

        test("simple nested loop", async () => {

            const handler = new TemplateHandler();

            const template = readFixture("loop - nested.docx");
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
