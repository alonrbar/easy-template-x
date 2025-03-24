import { TemplateDataError } from "./templateDataError";

export class UnknownContentTypeError extends TemplateDataError {

    public readonly tagRawText: string;
    public readonly contentType: string;
    public readonly path: string;

    constructor(contentType: string, tagRawText: string, path: string) {
        super(`Content type '${contentType}' does not have a registered plugin to handle it.`);

        this.contentType = contentType;
        this.tagRawText = tagRawText;
        this.path = path;
    }
}
