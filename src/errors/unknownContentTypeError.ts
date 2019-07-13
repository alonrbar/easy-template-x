export class UnknownContentTypeError extends Error {

    public readonly tagRawText: string;
    public readonly contentType: string;
    public readonly path: string;

    constructor(contentType: string, tagRawText: string, path: string) {
        super(`Content type '${contentType}' does not have a registered plugin to handle it.`);

        this.contentType = contentType;
        this.tagRawText = tagRawText;
        this.path = path;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UnknownContentTypeError.prototype);
    }
}