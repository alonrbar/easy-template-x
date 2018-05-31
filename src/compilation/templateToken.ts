export enum TokenType {
    Empty = "Empty",
    DelimiterStart = "DelimiterStart",
    DelimiterEnd = "DelimiterEnd",
    /**
     * Arbitrary text. Can be part of a template tag, or non-related.
     */
    Text = "Text"
}

export class TemplateToken {
    public type: TokenType;
    public xmlNode: Node;

    constructor(initial?: TemplateToken) {
        Object.assign(this, initial);
    }
}