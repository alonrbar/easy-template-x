import { TemplateSyntaxError } from "./templateSyntaxError";

export class UnopenedTagError extends TemplateSyntaxError {

    public readonly tagName: string;

    constructor(tagName: string) {
        super(`Tag '${tagName}' is closed but was never opened.`);

        this.tagName = tagName;
    }
}
