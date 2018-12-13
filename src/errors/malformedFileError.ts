export class MalformedFileError extends Error {

    public readonly expectedFileType: string;

    constructor(expectedFileType: string) {
        super(`Malformed file detected. Make sure the file is a valid ${expectedFileType} file.`);

        this.expectedFileType = expectedFileType;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MalformedFileError.prototype);
    }
}