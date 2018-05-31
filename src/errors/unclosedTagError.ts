export class UnclosedTagError extends Error {

    public readonly tagName: string;

    constructor(tagName: string) {
        super(`Tag '${tagName}' is never closed.`);

        this.tagName = tagName;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UnclosedTagError.prototype);
    }
}