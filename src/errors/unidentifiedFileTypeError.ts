export class UnidentifiedFileTypeError extends Error {
    constructor() {
        super(`The filetype for this file could not be identified, is this file corrupted?`);

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UnidentifiedFileTypeError.prototype);
    }
}