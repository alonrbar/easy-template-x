export class MissingCloseDelimiterError extends Error {

    public readonly openDelimiterText: string;

    constructor(openDelimiterText: string) {
        super(`Close delimiter is missing from '${openDelimiterText}'.`);

        this.openDelimiterText = openDelimiterText;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MissingCloseDelimiterError.prototype);
    }
}