export class MalformedFileError extends Error {
    readonly expectedFileType: string;
    constructor(expectedFileType: string);
}

export class MaxXmlDepthError extends Error {
    readonly maxDepth: number;
    constructor(maxDepth: number);
}

export class MissingArgumentError extends Error {
    argName: string;
    constructor(argName: string);
}

export class MissingStartDelimiterError extends Error {
    readonly closeDelimiterText: string;
    constructor(closeDelimiterText: string);
}

export class MissingCloseDelimiterError extends Error {
    readonly openDelimiterText: string;
    constructor(openDelimiterText: string);
}

export class UnknownContentTypeError extends Error {
    readonly tagRawText: string;
    readonly contentType: string;
    readonly path: string;
    constructor(contentType: string, tagRawText: string, path: string);
}

export class UnopenedTagError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export class UnclosedTagError extends Error {
    readonly tagName: string;
    constructor(tagName: string);
}

export class UnidentifiedFileTypeError extends Error {
    constructor();
}

export class UnsupportedFileTypeError extends Error {
    constructor(fileType: string);
}