export class MissingStartDelimiterError extends Error {

    public readonly closeTagText: string;

    constructor(closeTagText: string) {
        super(`Open delimiter is missing from '${closeTagText}'.`);

        this.closeTagText = closeTagText;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MissingStartDelimiterError.prototype);
    }
}