import { XmlNode } from "./xmlNode";

export class Delimiters {

    public tagStart = "{";
    public tagEnd = "}";
    public containerTagOpenPrefix = "#"; // TODO: use this...
    public containerTagClosingPrefix = "/"; // TODO: use this...

    constructor(initial?: Delimiters) {
        Object.assign(this, initial);

        if (!this.tagStart || !this.tagEnd)
            throw new Error('Both delimiters must be specified.');

        if (this.tagStart === this.tagEnd)
            throw new Error('Start and end delimiters can not be the same.');

        if (this.tagStart.length > 1 || this.tagEnd.length > 1)
            throw new Error(`Only single character delimiters supported (start: '${this.tagStart}', end: '${this.tagEnd}').`);

        // TODO: more validation...

        this.encodeValues();
    }

    private encodeValues() {
        const keysToEscape: (keyof Delimiters)[] = ['tagStart', 'tagEnd', 'containerTagOpenPrefix', 'containerTagClosingPrefix'];
        for (const key of keysToEscape) {
            const value = this[key];
            if (value) {
                this[key] = XmlNode.encodeValue(value);
            }
        }
    }
}