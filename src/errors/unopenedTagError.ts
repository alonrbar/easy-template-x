export class UnopenedTagError extends Error {

    public readonly tagName: string;

    constructor(tagName: string) {
        super(`Tag '${tagName}' is closed but was never opened.`);

        this.tagName = tagName;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UnopenedTagError.prototype);
    }
}