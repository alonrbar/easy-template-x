import { InternalError } from "./internalError";

export class InternalArgumentMissingError extends InternalError {

    public readonly argName: string;

    constructor(argName: string) {
        super(`Argument '${argName}' is missing.`);

        this.argName = argName;
    }
}
