export class MissingArgumentError extends Error {

    public readonly argName: string;

    constructor(argName: string) {
        super(`Argument '${argName}' is missing.`);

        this.argName = argName;

        // typescript hack: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, MissingArgumentError.prototype);
    }
}