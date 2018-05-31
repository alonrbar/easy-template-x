export enum TokenType {

}

export class TemplateToken {
    public type: TokenType;

    constructor(initial?: TemplateToken) {
        Object.assign(this, initial);
    }
}