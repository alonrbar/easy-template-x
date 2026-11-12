import { RelType, Styles } from "src/office";
import { describe, expect, test } from "vitest";

describe(Styles, () => {

    describe(Styles.prototype.findProperty, () => {

        const styles = createStyles(`
            <w:styles>
                <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
                    <w:rPr>
                        <w:sz w:val="22"/>
                    </w:rPr>
                </w:style>
                <w:style w:type="paragraph" w:styleId="Heading1">
                    <w:basedOn w:val="Normal"/>
                    <w:rPr>
                        <w:b/>
                    </w:rPr>
                </w:style>
                <w:style w:type="character" w:styleId="Strong">
                    <w:rPr>
                        <w:b/>
                    </w:rPr>
                </w:style>
            </w:styles>
        `);

        test.each([
            { name: "own property", type: "paragraph" as const, styleId: "Heading1", path: ["w:rPr", "w:b"], want: "w:b" },
            { name: "inherited property", type: "paragraph" as const, styleId: "Heading1", path: ["w:rPr", "w:sz"], want: "w:sz" },
            { name: "default style", type: "paragraph" as const, styleId: undefined, path: ["w:rPr", "w:sz"], want: "w:sz" },
            { name: "missing property", type: "paragraph" as const, styleId: "Heading1", path: ["w:rPr", "w:i"], want: undefined },
            { name: "style of another type", type: "paragraph" as const, styleId: "Strong", path: ["w:rPr", "w:b"], want: undefined },
            { name: "character style", type: "character" as const, styleId: "Strong", path: ["w:rPr", "w:b"], want: "w:b" },
            { name: "no default style for type", type: "table" as const, styleId: undefined, path: ["w:rPr", "w:sz"], want: undefined },
        ])("$name", async ({ type, styleId, path, want }) => {
            const got = await styles.findProperty(type, styleId, ...path);
            expect(got?.nodeName).toBe(want);
        });
    });

    describe(Styles.prototype.isNumbered, () => {

        const styles = createStyles(`
            <w:styles>
                <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
                    <w:name w:val="Normal"/>
                </w:style>
                <w:style w:type="paragraph" w:styleId="ListParagraph">
                    <w:basedOn w:val="Normal"/>
                    <w:pPr>
                        <w:numPr>
                            <w:numId w:val="7"/>
                        </w:numPr>
                    </w:pPr>
                </w:style>
                <w:style w:type="paragraph" w:styleId="DerivedList">
                    <w:basedOn w:val="ListParagraph"/>
                </w:style>
                <w:style w:type="paragraph" w:styleId="NotNumbered">
                    <w:basedOn w:val="ListParagraph"/>
                    <w:pPr>
                        <w:numPr>
                            <w:numId w:val="0"/>
                        </w:numPr>
                    </w:pPr>
                </w:style>
                <w:style w:type="paragraph" w:styleId="LoopA">
                    <w:basedOn w:val="LoopB"/>
                </w:style>
                <w:style w:type="paragraph" w:styleId="LoopB">
                    <w:basedOn w:val="LoopA"/>
                </w:style>
                <w:style w:type="character" w:styleId="CharStyle">
                    <w:pPr>
                        <w:numPr>
                            <w:numId w:val="7"/>
                        </w:numPr>
                    </w:pPr>
                </w:style>
            </w:styles>
        `);

        test.each([
            { name: "numbered style", styleId: "ListParagraph", want: true },
            { name: "numbering inherited through basedOn", styleId: "DerivedList", want: true },
            { name: "numbering removed with numId 0", styleId: "NotNumbered", want: false },
            { name: "plain style", styleId: "Normal", want: false },
            { name: "default style", styleId: undefined, want: false },
            { name: "unknown style", styleId: "Missing", want: false },
            { name: "circular basedOn chain", styleId: "LoopA", want: false },
            { name: "non-paragraph style", styleId: "CharStyle", want: false },
        ])("$name", async ({ styleId, want }) => {
            const got = await styles.isNumbered(styleId);
            expect(got).toBe(want);
        });

        test("numbered default style", async () => {
            const defaultNumbered = createStyles(`
                <w:styles>
                    <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
                        <w:pPr>
                            <w:numPr>
                                <w:numId w:val="3"/>
                            </w:numPr>
                        </w:pPr>
                    </w:style>
                </w:styles>
            `);
            expect(await defaultNumbered.isNumbered(undefined)).toBe(true);
        });

        test("no styles part", async () => {
            const empty = createStyles(null);
            expect(await empty.isNumbered("ListParagraph")).toBe(false);
        });
    });
});

function createStyles(stylesXml: string): Styles {
    const fakeRels: any = {
        list: () => Promise.resolve(stylesXml ? [{ type: RelType.Styles, target: "styles.xml" }] : []),
        absoluteTargetPath: (target: string) => `word/${target}`
    };
    const fakeZip: any = {
        getFile: () => ({
            getContentText: () => Promise.resolve(stylesXml.trim())
        })
    };
    return new Styles(fakeRels, fakeZip);
}
