export class MissingCloseDelimiterError extends Error {

    public readonly openDelimiterText: string;

    constructor(openDelimiterText: string) {
        super(`Close delimiter is missing from '${openDelimiterText}'.`);

        this.openDelimiterText = openDelimiterText;
    }
}
