import { TemplateSyntaxError } from "./templateSyntaxError";

export class UnopenedTagError extends TemplateSyntaxError {

    public readonly tagName: string;
    public readonly tagRawText: string;

    constructor(tagName: string, tagRawText: string) {
        super(`Tag ${tagRawText} is closed but was never opened.`);

        this.tagName = tagName;
        this.tagRawText = tagRawText;
    }
}
