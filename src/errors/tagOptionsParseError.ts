export class TagOptionsParseError extends Error {

    public readonly tagRawText: string;
    public readonly parseError: Error;

    constructor(tagRawText: string, parseError: Error) {
        super(`Failed to parse tag options of '${tagRawText}': ${parseError.message}.`);

        this.tagRawText = tagRawText;
        this.parseError = parseError;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, TagOptionsParseError.prototype);
    }
}
