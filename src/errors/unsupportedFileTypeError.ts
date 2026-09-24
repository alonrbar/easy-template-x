import { TemplateFileError } from "./templateFileError";

export class UnsupportedFileTypeError extends TemplateFileError {

    public readonly fileType: string;

    constructor(fileType: string) {
        super(`Filetype "${fileType}" is not supported.`);

        this.fileType = fileType;
    }
}
