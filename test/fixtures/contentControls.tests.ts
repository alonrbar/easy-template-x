import { TemplateHandler } from "src/templateHandler";
import { describe, expect, it } from "vitest";
import { readFixture } from "./fixtureUtils";
import { compareableText } from "test/testUtils";

describe('content controls fixture', () => {

    it("process content controls", async () => {

        const template = readFixture("content controls.docx");

        const handler = new TemplateHandler({
            delimiters: {
                tagStart: '{{',
                tagEnd: '}}',
                containerTagOpen: '>>',
                containerTagClose: '<<'
            }
        });

        // Modern content controls:
        // If a tag is found inside an stdContent element, we extract all
        // children of the stdContent and use it to replace the entire std
        // element, then we process the tag.

        // Legacy content controls:
        // If a tag is between a run with fldChar child that has fldCharType="separate" 
        // and a run with fldChar child that has fldCharType="end", we extract the content 
        // between the two runs and use it to replace everything between a run with 
        // fldChar child that has fldCharType="begin" and the run with the fldCharType="end", 
        // then we process the tag.

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

        // const data = {
        //     // insert a table
        //     simple_prop: {
        //         _type: 'rawXml',
        //         xml: '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Hello</w:t></w:r></w:p></w:tc></w:tr></w:tbl>',
        //         replaceParagraph: true
        //     }
        // };

        // const doc = await handler.process(template, data);

        // const docXml = await handler.getXml(doc);
        // expect(docXml).toMatchSnapshot();

        // writeTempFile('raw xml - output.docx', doc);
    });
});
