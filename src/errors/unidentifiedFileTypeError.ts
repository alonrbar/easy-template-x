export class UnidentifiedFileTypeError extends Error {
    constructor() {
        super(`The filetype for this file could not be identified, is this file corrupted?`);
    }
}
