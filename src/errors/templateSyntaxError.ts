/**
 * Base class for errors caused by invalid syntax in the template file.
 * Things like an unclosed tag or a wrong tag placement in the document.
 */
export class TemplateSyntaxError extends Error {

    constructor(message: string) {
        super(message);
    }
}
