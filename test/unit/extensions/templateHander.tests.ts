import { TemplateHandler, TemplateContext, ScopeData, TemplateData, Docx } from "src";
import TemplateExtension, { mockExecute } from '../../__mocks__/TemplateExtension';

beforeEach(() => {
    TemplateExtension.mockClear();
    mockExecute.mockClear();
});

describe(nameof(TemplateHandler), () => {
    describe(nameof(TemplateHandler.prototype.callExtensions), () => {
        it('calls each extension', () => {
            const firstTemplateExtension = new TemplateExtension();
            const secondTemplateExtension = new TemplateExtension();

            const handler = new TemplateHandler({
                extensions: [
                    firstTemplateExtension,
                    secondTemplateExtension
                ]
            });

            // load the docx file
            const docx: Docx = null;
            const context: TemplateContext = {
                docx: docx
            };

            const data: TemplateData = {};
            const scopeData = new ScopeData(data);

            handler.callExtensions(scopeData, context);

            expect(firstTemplateExtension.execute.mock.calls.length).toBe(1);
            expect(secondTemplateExtension.execute.mock.calls.length).toBe(1);
        });
    });
});
