import { TemplateSyntaxError } from "./templateSyntaxError";

export class MissingStartDelimiterError extends TemplateSyntaxError {

    public readonly closeDelimiterText: string;

    constructor(closeDelimiterText: string) {
        super(`Open delimiter is missing from '${closeDelimiterText}'.`);

        this.closeDelimiterText = closeDelimiterText;
    }
}
