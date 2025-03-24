import { TemplateSyntaxError } from "./templateSyntaxError";

export class TagOptionsParseError extends TemplateSyntaxError {

    public readonly tagRawText: string;
    public readonly parseError: Error;

    constructor(tagRawText: string, parseError: Error) {
        super(`Failed to parse tag options of '${tagRawText}': ${parseError.message}.`);

        this.tagRawText = tagRawText;
        this.parseError = parseError;
    }
}
