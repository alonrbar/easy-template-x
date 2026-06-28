import { TemplateSyntaxError } from "./templateSyntaxError";

export class UnclosedTagError extends TemplateSyntaxError {

    public readonly tagName: string;
    public readonly tagRawText: string;

    constructor(tagName: string, tagRawText: string) {
        super(`Tag ${tagRawText} is never closed.`);

        this.tagName = tagName;
        this.tagRawText = tagRawText;
    }
}
