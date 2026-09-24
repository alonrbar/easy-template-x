import { TemplateFileError } from "./templateFileError";

export class MalformedFileError extends TemplateFileError {

    constructor(message: string) {
        super(message);
    }
}
