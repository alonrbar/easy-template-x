import { XmlNode } from "./xmlNode";

export class Delimiters {

    public tagStart = "{";
    public tagEnd = "}";
    public containerTagOpen = "#";
    public containerTagClose = "/";

    constructor(initial?: Delimiters) {
        Object.assign(this, initial);

        this.encodeAndValidate();

        if (this.tagStart === this.tagEnd)
            throw new Error(`${nameof(this.tagStart)} can not be equal to ${nameof(this.tagEnd)}`);

        if (this.containerTagOpen === this.containerTagClose)
            throw new Error(`${nameof(this.containerTagOpen)} can not be equal to ${nameof(this.containerTagClose)}`);
    }

    private encodeAndValidate() {
        const keys: (keyof Delimiters)[] = ['tagStart', 'tagEnd', 'containerTagOpen', 'containerTagClose'];
        for (const key of keys) {
            const value = this[key];

            if (!value)
                throw new Error(`${key} must be specified.`);

            if (value.length > 1)
                throw new Error(`Only single character delimiters supported (${key}: '${value}').`);

            this[key] = XmlNode.encodeValue(value);
        }
    }
}