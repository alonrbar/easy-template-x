export class TagOptionsParseError extends Error {

    public readonly tagRawText: string;
    public readonly parseError: Error;

    constructor(tagRawText: string, parseError: Error) {
        super(`Failed to parse tag options of '${tagRawText}': ${parseError.message}.`);

        this.tagRawText = tagRawText;
        this.parseError = parseError;
    }
}
