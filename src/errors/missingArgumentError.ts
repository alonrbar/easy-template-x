export class MissingArgumentError extends Error {

    public readonly argName: string;

    constructor(argName: string) {
        super(`Argument '${argName}' is missing.`);

        this.argName = argName;
    }
}
