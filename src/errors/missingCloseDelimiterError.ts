export class MissingCloseDelimiterError extends Error {

    public readonly openTagText: string;

    constructor(openTagText: string) {
        super(`Close delimiter is missing from '${openTagText}'.`);

        this.openTagText = openTagText;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MissingCloseDelimiterError.prototype);
    }
}