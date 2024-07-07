export class MissingStartDelimiterError extends Error {

    public readonly closeDelimiterText: string;

    constructor(closeDelimiterText: string) {
        super(`Open delimiter is missing from '${closeDelimiterText}'.`);

        this.closeDelimiterText = closeDelimiterText;
    }
}
