import { TemplateData, TemplateHandler } from "src";
import { TemplateExtension } from "src/extensions";
import { readResource } from "test/testUtils";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

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
    describe(TemplateHandler.prototype.process, () => {
        it('calls each extension', async () => {
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
});
