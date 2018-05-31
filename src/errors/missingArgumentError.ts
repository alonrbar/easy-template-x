export class MissingArgumentError extends Error {
    constructor(argName: string) {
        super(`Argument '${argName}' is missing.`);

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MissingArgumentError.prototype);
    }
}