import { TagDisposition } from "src/compilation";
import { DelimiterSearcher } from "src/compilation/delimiters";
import { TagParser } from "src/compilation/tagParser";
import { TemplateCompiler } from "src/compilation/templateCompiler";
import { Delimiters } from "src/delimiters";
import { MissingCloseDelimiterError } from "src/errors";
import { createDefaultPlugins, LOOP_CONTENT_TYPE, TEXT_CONTENT_TYPE } from "src/plugins";
import { parseXml } from "test/testUtils";
import { describe, expect, test } from "vitest";

describe(TemplateCompiler, () => {

    describe(TemplateCompiler.prototype.parseTags, () => {

        test("simple", () => {
            const compiler = createTemplateCompiler();
            
            const tags = compiler.parseTags(parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{#loop}{/loop}</w:t>
                    </w:r>
                </w:p>
            `));
            
            expect(tags.length).toEqual(2);
            expect(tags[0].name).toEqual('loop');
            expect(tags[0].disposition).toEqual(TagDisposition.Open);
            expect(tags[1].name).toEqual('loop');
            expect(tags[1].disposition).toEqual(TagDisposition.Close);
        });

        test("inline drawing in the middle of a text tag breaks the tag", () => {
            const compiler = createTemplateCompiler();
            expect(() => compiler.parseTags(parseXml(`
                <w:p>
                    <w:r>
                        <w:t xml:space="preserve">{Text </w:t>
                    </w:r>
                    <w:r>
                        <w:drawing>
                            <wp:inline>
                                <wp:docPr descr="{Attribute Tag}"/>
                            </wp:inline>
                        </w:drawing>
                    </w:r>
                    <w:r>
                        <w:t>Tag}</w:t>
                    </w:r>
                </w:p>
            `, false))).toThrow(MissingCloseDelimiterError);
        });

        test("floating drawing in the middle of a tag is ignored", () => {
            const compiler = createTemplateCompiler();
            const tags = compiler.parseTags(parseXml(`
                <w:p>
                    <w:r>
                        <w:t>{Text </w:t>
                    </w:r>
                    <w:r>
                        <w:drawing>
                            <wp:anchor>
                                <wp:docPr descr="{Attribute Tag}"/>
                            </wp:anchor>
                        </w:drawing>
                    </w:r>
                    <w:r>
                        <w:t>Tag}</w:t>
                    </w:r>
                </w:p>
            `, false));
            expect(tags.length).toEqual(2);
            expect(tags[0].name).toEqual('Attribute Tag');
            expect(tags[1].name).toEqual('Text Tag');
        });
    });
});

function createTemplateCompiler(): TemplateCompiler {
    const delimiters = new Delimiters();

    const delimiterSearcher = new DelimiterSearcher(delimiters, 20);
    const tagParser = new TagParser(delimiters);
    const plugins = createDefaultPlugins();

    return new TemplateCompiler(delimiterSearcher, tagParser, plugins, {
        defaultContentType: TEXT_CONTENT_TYPE,
        containerContentType: LOOP_CONTENT_TYPE
    });
}
