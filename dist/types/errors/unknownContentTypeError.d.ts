export declare class UnknownContentTypeError extends Error {
    readonly tagRawText: string;
    readonly contentType: string;
    readonly path: string;
    constructor(contentType: string, tagRawText: string, path: string);
}
