import { TemplateHandler } from "src/templateHandler";
import { compareableText } from "test/testUtils";
import { describe, expect, test } from "vitest";
import { readFixture } from "./fixtureUtils";
import { TemplateSyntaxError } from "src/errors";

// Possible support for content controls in the future, should probably be
// behind a TemplateHandler option flag:
//
// Modern content controls: 
//
// If a tag is found inside an stdContent element, we extract all children of
// the stdContent and use it to replace the entire std element, then we process
// the tag.
//
// Legacy content controls: 
//
// If a tag is between a run with fldChar child that has fldCharType="separate"
// and a run with fldChar child that has fldCharType="end", we extract the
// content between the two runs and use it to replace everything between a run
// with fldChar child that has fldCharType="begin" and the run with the
// fldCharType="end", then we process the tag.

describe('content controls fixture', () => {

    test("parse tags in content controls", async () => {

        const template = readFixture("content controls.docx");

        const handler = new TemplateHandler({
            delimiters: {
                tagStart: '{{',
                tagEnd: '}}',
                containerTagOpen: '>>',
                containerTagClose: '<<'
            }
        });

        const templateText = await handler.getText(template);
        expect(compareableText(templateText)).toEqual(compareableText(`

            Standard

            Plain text: Click or tap here to enter text.
            Rich text: Click or tap here to enter text.
            Picture:
            Checkbox: ☐
            Dropdown: Choose an item.

            Legacy

            Legacy text: FORMTEXT
            Legacy checkbox: FORMCHECKBOX
            Legacy dropdown: FORMDROPDOWN

            Standard - Text - Tags and Loop
            
            Hello {{ >> Loop1 }} Something1 {{ Tag1 }}{{ << }}


            Standard - Rich Text - Tags and Loop
            
            Hello {{ >> Loop2 }} Something2 {{ Tag2 }}{{ << }}


            Legacy - Text - Tags and Loop

            Hello FORMTEXT{{ >> Loop3 }} Something3 FORMTEXT{{ Tag3 }}{{ << }}
        `));

        const tags = await handler.parseTags(template);

        expect(tags.length).toEqual(9);
        expect(tags[0].rawText).toEqual('{{ >> Loop1 }}');
        expect(tags[1].rawText).toEqual('{{ Tag1 }}');
        expect(tags[2].rawText).toEqual('{{ << }}');
        expect(tags[3].rawText).toEqual('{{ >> Loop2 }}');
        expect(tags[4].rawText).toEqual('{{ Tag2 }}');
        expect(tags[5].rawText).toEqual('{{ << }}');
        expect(tags[6].rawText).toEqual('{{ >> Loop3 }}');
        expect(tags[7].rawText).toEqual('{{ Tag3 }}');
        expect(tags[8].rawText).toEqual('{{ << }}');
    });

    test("throws syntax error if a loop tag is found inside a content control", async () => {
        const template = readFixture("content controls.docx");

        const handler = new TemplateHandler({
            delimiters: {
                tagStart: '{{',
                tagEnd: '}}',
                containerTagOpen: '>>',
                containerTagClose: '<<'
            }
        });

        const data = {};

        let error: Error;
        try {
            await handler.process(template, data);
        } catch (e) {
            error = e as Error;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(TemplateSyntaxError);
        expect(error.message).toContain('content control');
    });
});
