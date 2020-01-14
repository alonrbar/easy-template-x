import { writeTempFile } from "../../testUtils";
import { readFixture } from "../../fixtures/fixtureUtils";
import { ContentControlExtension } from "../../../src/extensions/contentControlExtension";
import { createHandler } from "./contentControlUtils";

describe(nameof(ContentControlExtension), () => {
    it("updates content controls", async () => {
        const template = readFixture("content control.docx");
        const data = {
            "-539357386": {
                _type: "checkBox",
                checked: true
            },
            "663591227": {
                _type: "datePicker",
                date: new Date("2019-10-13T00:00:00Z")
            },
            "-191383590": {
                _type: "plainText",
                text: "Plain Text"
            },
            "329261350": {
                _type: "richText",
                xml: `<w:r w:rsidR="00A350F0">
                <w:t>
                    Rich,
                </w:t>
            </w:r>
            <w:r w:rsidR="00A350F0">
                <w:br/>
                <w:t>
                    Text
                </w:t>
            </w:r>`
            }
        };

        const handler = createHandler();
        const buffer: Buffer = await handler.process(template, data);

        writeTempFile("content control.docx", buffer);
    });
});
