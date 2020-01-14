import { writeTempFile } from "../../testUtils";
import { readFixture } from "../../fixtures/fixtureUtils";
import { createHandler } from "./dataBindingUtils";
import { DataBindingExtension } from "../../../src/extensions/dataBindingExtension";

describe(nameof(DataBindingExtension), () => {
    it("updates data bindings in a form", async () => {
        const template = readFixture("data binding.docx");
        const data = {
            "/data/CHECKBOX": {
                _type: "boolean",
                value: true
            },
            "/data/DATE": {
                _type: "date",
                value: new Date("2019-04-01T12:00:00Z")
            },
            "/data/NUMBER": {
                _type: "text",
                value: "999"
            },
            "/data/RICH_TEXT": {
                _type: "text",
                value: `Example Rich Text`
            },
            "/data/TEXT": {
                _type: "text",
                value: `Example Text`
            }
        };

        const handler = createHandler();
        const buffer: Buffer = await handler.process(template, data);

        writeTempFile("data binding.docx", buffer);
    });
});
