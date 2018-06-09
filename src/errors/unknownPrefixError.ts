export class UnknownPrefixError extends Error {

    public readonly tagRawText: string;

    constructor(tagRawText: string) {
        super(`Tag '${tagRawText}' does not match any of the known prefixes.`);

        this.tagRawText = tagRawText;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UnknownPrefixError.prototype);
    }
}