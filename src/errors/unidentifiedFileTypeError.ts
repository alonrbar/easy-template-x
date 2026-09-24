import { TemplateFileError } from "./templateFileError";

export class UnidentifiedFileTypeError extends TemplateFileError {
    constructor() {
        super(`The filetype for this file could not be identified, is this file corrupted?`);
    }
}
