export declare class MalformedFileError extends Error {
    readonly expectedFileType: string;
    constructor(expectedFileType: string);
}
