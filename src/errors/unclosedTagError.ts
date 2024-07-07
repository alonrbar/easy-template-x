export class UnclosedTagError extends Error {

    public readonly tagName: string;

    constructor(tagName: string) {
        super(`Tag '${tagName}' is never closed.`);

        this.tagName = tagName;
    }
}
