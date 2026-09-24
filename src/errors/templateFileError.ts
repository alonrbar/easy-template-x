/**
 * Base class for errors caused by a file that cannot be read or processed.
 * Things like corrupted or unsupported file types or malformed XML structure
 * for the internal Office Open XML parts.
 */
export class TemplateFileError extends Error {

    constructor(message: string) {
        super(message);
    }
}
