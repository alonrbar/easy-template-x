export class MissingStartDelimiterError extends Error {

    public readonly closeDelimiterText: string;

    constructor(closeDelimiterText: string) {
        super(`Open delimiter is missing from '${closeDelimiterText}'.`);

        this.closeDelimiterText = closeDelimiterText;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MissingStartDelimiterError.prototype);
    }
}