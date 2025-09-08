import { TemplateHandler, TemplateData } from "src";
import { readResource } from "test/testUtils";
import { TemplateExtension } from "src/extensions";

const beforeCompilationExecute = jest.fn();
const afterCompilationExecute = jest.fn();
const setUtilities = jest.fn();

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
