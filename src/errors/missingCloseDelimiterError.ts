import { TemplateSyntaxError } from "./templateSyntaxError";

export class MissingCloseDelimiterError extends TemplateSyntaxError {

    public readonly openDelimiterText: string;

    constructor(openDelimiterText: string) {
        super(`Close delimiter is missing from '${openDelimiterText}'.`);

        this.openDelimiterText = openDelimiterText;
    }
}
