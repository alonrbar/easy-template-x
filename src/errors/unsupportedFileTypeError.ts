export class UnsupportedFileTypeError extends Error {
    constructor(fileType: string) {
        super(`Filetype "${fileType}" is not supported.`);

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
    }
}