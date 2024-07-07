export class MalformedFileError extends Error {

    public readonly expectedFileType: string;

    constructor(expectedFileType: string) {
        super(`Malformed file detected. Make sure the file is a valid ${expectedFileType} file.`);

        this.expectedFileType = expectedFileType;
    }
}
