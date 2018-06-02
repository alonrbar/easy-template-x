export enum TokenType {
    Empty = "Empty",
    /**
     * The token contains at least one delimiter.
     */
    Delimiter = "Delimiter",
    /**
     * Arbitrary text. Can be part of a template tag, or non-related.
     */
    Text = "Text"
}

export interface DelimiterMark {
    index: number;
    isOpen: boolean;
}

export class TemplateToken {
    public type: TokenType;
    public delimiters: DelimiterMark[] = [];
    public xmlNode: Node;
    public prev: TemplateToken;
    public next: TemplateToken;

    constructor(initial?: Partial<TemplateToken>) {
        Object.assign(this, initial);
    }
}