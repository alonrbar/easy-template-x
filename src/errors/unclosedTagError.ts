import { TemplateSyntaxError } from "./templateSyntaxError";

export class UnclosedTagError extends TemplateSyntaxError {

    public readonly tagName: string;

    constructor(tagName: string) {
        super(`Tag '${tagName}' is never closed.`);

        this.tagName = tagName;
    }
}
