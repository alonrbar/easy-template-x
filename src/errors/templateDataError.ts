
/**
 * Base class for errors caused by invalid data passed to the template engine.
 * Things like an image "transparency" value that is not between 0 and 100, or a
 * scatter chart series value that is missing an "x" or "y" value.
 */
export class TemplateDataError extends Error {

    constructor(message: string) {
        super(message);
    }
}
