export class InternalError extends Error {

    constructor(message: string) {
        super(`Internal error: ${message}`);
    }
}
