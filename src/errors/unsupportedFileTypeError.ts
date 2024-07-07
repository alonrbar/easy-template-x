export class UnsupportedFileTypeError extends Error {

    public readonly fileType: string;

    constructor(fileType: string) {
        super(`Filetype "${fileType}" is not supported.`);

        this.fileType = fileType;
    }
}
